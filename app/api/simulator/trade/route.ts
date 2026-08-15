// app/api/simulator/trade/route.ts
// Authoritative, server-side trade execution.
//
// Previously hooks/useSimulator.ts's executeTrade() ran the ENTIRE BUY/SELL
// transaction client-side via the Firestore client SDK, trusting the
// client's own in-memory `stock.ltp` and writing balance/portfolio straight
// to Firestore. Anyone with devtools access could fabricate a price locally
// (or, before firestore.rules gained isSaneBalance(), edit the balance field
// directly) — see the four accounts with 10^10-10^31 "coins" that prompted
// this fix.
//
// This route re-derives the price server-side from the same market_info
// document the client reads for display, runs the same BUY/SELL business
// rules (commission, T+1, insufficient balance/shares) inside an Admin SDK
// transaction, and is the only thing that may accept a trade request; the
// client no longer computes or writes balance/portfolio itself.

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { isMarketOpenServer } from '@/lib/utils/marketHours';
import { COMMISSION_RATE, moneyAdd, moneySubtract, moneyMultiply, roundMoney } from '@/lib/utils/money';

// Ensure Firebase Admin is initialized with full credentials
import '@/lib/coinManagerServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUANTITY = 1_000_000;
// Matches firestore.rules' isSaneBalance() cap. Admin SDK writes bypass
// firestore.rules entirely, so this route has to re-enforce the same
// ceiling by hand on the one side (SELL) where a trade increases balance —
// otherwise this endpoint would itself become a new path to an unbounded
// balance.
const SANE_BALANCE_CAP = 100_000_000;

interface PortfolioItem {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  totalCost: number;
  purchaseDate: string;
}

interface SimulatorStateDoc {
  balance: number;
  portfolio: PortfolioItem[];
  totalInvested?: number;
  realizedGainLoss?: number;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Missing or invalid Authorization header' }, { status: 401 });
    }
    const token = authHeader.substring(7).trim();

    const adminAuth = getAuth();
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }
    const uid = decodedToken.uid;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { symbol, type, quantity } = body || {};

    if (typeof symbol !== 'string' || !symbol.trim()) {
      return NextResponse.json({ success: false, error: 'Invalid Stock' }, { status: 400 });
    }
    if (type !== 'BUY' && type !== 'SELL') {
      return NextResponse.json({ success: false, error: "Type must be 'BUY' or 'SELL'" }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_QUANTITY) {
      return NextResponse.json({ success: false, error: 'Quantity must be a positive integer' }, { status: 400 });
    }

    if (!isMarketOpenServer()) {
      return NextResponse.json(
        { success: false, error: 'Market is closed. Orders are only allowed during market hours (10:00 AM - 2:15 PM).' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1';

    // Authoritative price: the same market_info doc the client displays.
    // The request body's price (if any) is never read or trusted.
    const marketRef = db.doc(`artifacts/${appId}/public/data/market_info/latest`);
    const marketSnap = await marketRef.get();
    if (!marketSnap.exists) {
      return NextResponse.json({ success: false, error: 'Market data not available' }, { status: 503 });
    }
    const stocks = (marketSnap.data()?.stocks || []) as Array<{ symbol: string; ltp: number }>;
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock || typeof stock.ltp !== 'number' || !Number.isFinite(stock.ltp) || stock.ltp <= 0) {
      return NextResponse.json({ success: false, error: 'Stock not found or invalid price' }, { status: 400 });
    }

    const stateRef = db.doc(`artifacts/${appId}/users/${uid}/simulator/state`);
    const historyColRef = db.collection(`artifacts/${appId}/users/${uid}/simulator/state/trade_history`);

    const result = await db.runTransaction(async (transaction) => {
      const stateDoc = await transaction.get(stateRef);
      if (!stateDoc.exists) throw new Error('Simulator state not found');

      const currentState = stateDoc.data() as SimulatorStateDoc;
      const currentBalance =
        typeof currentState.balance === 'number' && Number.isFinite(currentState.balance) ? currentState.balance : 0;
      const portfolio = [...(currentState.portfolio || [])];
      const itemIndex = portfolio.findIndex((item) => item.symbol === symbol);
      const existingItem = itemIndex >= 0 ? portfolio[itemIndex] : null;

      const grossValue = moneyMultiply(stock!.ltp, quantity);
      const commission = roundMoney(grossValue * COMMISSION_RATE);

      let newBalance: number;
      let tradeTotalAmount: number;

      if (type === 'BUY') {
        const totalCost = moneyAdd(grossValue, commission);
        if (currentBalance < totalCost) {
          throw new Error(`Insufficient balance. Required: ৳${totalCost.toFixed(2)}`);
        }

        if (existingItem) {
          const newTotalCost = moneyAdd(existingItem.totalCost, totalCost);
          const newQuantity = existingItem.quantity + quantity;
          portfolio[itemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            averageBuyPrice: roundMoney(newTotalCost / newQuantity),
            totalCost: newTotalCost,
          };
        } else {
          portfolio.push({
            symbol,
            quantity,
            averageBuyPrice: roundMoney(totalCost / quantity),
            totalCost,
            purchaseDate: new Date().toISOString(),
          });
        }

        newBalance = moneySubtract(currentBalance, totalCost);
        tradeTotalAmount = -totalCost;

        transaction.set(stateRef, {
          ...currentState,
          balance: newBalance,
          portfolio,
          totalInvested: moneyAdd(currentState.totalInvested || 0, totalCost),
        });
      } else {
        if (!existingItem || existingItem.quantity < quantity) {
          throw new Error(`Insufficient shares. You own ${existingItem?.quantity || 0}.`);
        }

        const bdOptions = { timeZone: 'Asia/Dhaka' };
        const purchaseDateStr = new Date(existingItem.purchaseDate).toLocaleDateString('en-CA', bdOptions);
        const todayDateStr = new Date().toLocaleDateString('en-CA', bdOptions);
        if (purchaseDateStr === todayDateStr) {
          throw new Error('T+1 Rule: Cannot sell shares on the same day of purchase.');
        }

        const netProceeds = moneySubtract(grossValue, commission);
        const averageCost = existingItem.averageBuyPrice;
        const costOfSoldShares = moneyMultiply(averageCost, quantity);
        const realizedGain = moneySubtract(netProceeds, costOfSoldShares);

        newBalance = moneyAdd(currentBalance, netProceeds);
        if (newBalance > SANE_BALANCE_CAP) {
          throw new Error('Trade rejected: resulting balance would exceed the allowed maximum.');
        }

        if (existingItem.quantity === quantity) {
          portfolio.splice(itemIndex, 1);
        } else {
          portfolio[itemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity - quantity,
            totalCost: moneySubtract(existingItem.totalCost, costOfSoldShares),
          };
        }

        tradeTotalAmount = netProceeds;

        transaction.set(stateRef, {
          ...currentState,
          balance: newBalance,
          portfolio,
          totalInvested: moneySubtract(currentState.totalInvested || 0, costOfSoldShares),
          realizedGainLoss: moneyAdd(currentState.realizedGainLoss || 0, realizedGain),
        });
      }

      const newHistoryRef = historyColRef.doc();
      transaction.set(newHistoryRef, {
        symbol,
        type,
        quantity,
        price: stock!.ltp,
        commission,
        totalAmount: tradeTotalAmount,
        timestamp: new Date().toISOString(),
      });

      return { newBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}.`,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('❌ Trade API error:', error);
    const message = error?.message || 'Failed to execute trade';
    // Business-rule rejections (insufficient balance/shares, T+1, missing
    // state, cap) are client-correctable — surface them as 400s with their
    // real message. Anything else stays a generic 500 so internals aren't leaked.
    const isBusinessRuleError = /Insufficient|T\+1 Rule|Simulator state not found|exceed the allowed maximum/.test(
      message
    );
    return NextResponse.json(
      { success: false, error: isBusinessRuleError ? message : 'Failed to execute trade' },
      { status: isBusinessRuleError ? 400 : 500 }
    );
  }
}
