'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Unsubscribe
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { getUpcomingHolidays } from '@/lib/bangladeshHolidays';
import { fetchWithFreshToken } from '@/lib/utils/fetchWithToken';

// =====================================================
// PRECISION MONEY MATH UTILITIES
// Shared with the server-side trade API (app/api/simulator/trade/route.ts)
// via lib/utils/money.ts so the two never compute a trade differently. Used
// here only for fast client-side display math (portfolio value/gain-loss);
// the actual trade cost/proceeds are now computed authoritatively server-side.
// =====================================================
import { moneyAdd, moneyMultiply, moneySubtract, roundMoney } from '@/lib/utils/money';

export interface Stock {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  category?: string;
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  totalCost: number;
  purchaseDate: string;
  lots?: { quantity: number; purchaseDate: string }[];
}

export interface SimulatorState {
  balance: number;
  portfolio: PortfolioItem[];
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  gainLossPercent: number;
  realizedGainLoss: number;
}

export interface MarketInfo {
  stocks: Stock[];
  lastUpdated: string;
  totalStocks: number;
}

export const useSimulator = () => {
  const { user } = useAuth();
  const db = getFirestore();
  
  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [simulatorState, setSimulatorState] = useState<SimulatorState>({
    balance: 10000,
    portfolio: [],
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    gainLossPercent: 0,
    realizedGainLoss: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [bangladeshHolidays, setBangladeshHolidays] = useState<string[]>([]);
  const [nextUpdateIn, setNextUpdateIn] = useState(180); // 3 minutes countdown
  
  const marketUnsubscribe = useRef<Unsubscribe | null>(null);
  const categoriesUnsubscribe = useRef<Unsubscribe | null>(null);
  const stateUnsubscribe = useRef<Unsubscribe | null>(null);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  // ── 1. Load Bangladesh Holidays ──
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const holidays = await getUpcomingHolidays();
        setBangladeshHolidays(holidays);
      } catch (err) {
        console.warn('Failed to load holidays:', err);
        setBangladeshHolidays([]);
      }
    };
    loadHolidays();
  }, []);

  // ── 2. Polling Market Data (With Efficient Countdown) ──
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let isMounted = true;
    let timerId: NodeJS.Timeout;

    const fetchMarketData = async () => {
      if (document.hidden) return; // Efficiency Upgrade
      
      try {
        const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1';
        const marketRef = doc(db, 'artifacts', appId, 'public', 'data', 'market_info', 'latest');
        const snapshot = await getDoc(marketRef);

        if (snapshot.exists() && isMounted) {
          const data = snapshot.data() as MarketInfo;
          const mergedStocks = data.stocks.map(stock => {
            const calculatedChangePercent = stock.changePercent !== undefined 
              ? stock.changePercent 
              : (stock.ltp - stock.change > 0 ? (stock.change / (stock.ltp - stock.change)) * 100 : 0);
              
            return {
              ...stock,
              changePercent: calculatedChangePercent,
              category: categoryMap[stock.symbol] || stock.category
            };
          });
          setMarketInfo({ ...data, stocks: mergedStocks });
          setNextUpdateIn(180); // Reset timer on successful fetch
        } else if (isMounted && !marketInfo) {
          setMarketInfo({ stocks: [], lastUpdated: new Date().toISOString(), totalStocks: 0 });
        }
      } catch (err) {
        if (isMounted) setError('Failed to load market data');
      }
    };

    fetchMarketData();

    // 1-second interval handles both the UI countdown and triggering the fetch
    timerId = setInterval(() => {
      if (document.hidden) return; // Pause countdown if user is in another tab
      
      setNextUpdateIn((prev) => {
        if (prev <= 1) {
          fetchMarketData();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    // Fetch immediately and reset timer when user comes back to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMarketData();
        setNextUpdateIn(180);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => { 
      isMounted = false; 
      clearInterval(timerId); 
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, db, categoryMap]);

  // ── 3. Categories Listener ──
  useEffect(() => {
    if (!user) return;
    try {
      const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1';
      const categoriesRef = doc(db, 'artifacts', appId, 'public', 'data', 'market_info', 'categories');
      categoriesUnsubscribe.current = onSnapshot(categoriesRef, (snapshot) => {
        if (snapshot.exists()) setCategoryMap(snapshot.data().categories || {});
      });
    } catch (err) { console.warn('Categories listener error:', err); }

    return () => { if (categoriesUnsubscribe.current) categoriesUnsubscribe.current(); };
  }, [user, db]);

  // ── 4. Simulator State Listener ──
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    try {
      const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1';
      const stateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'simulator', 'state');
      
      stateUnsubscribe.current = onSnapshot(stateRef, async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Omit<SimulatorState, 'totalCurrentValue' | 'totalGainLoss' | 'gainLossPercent'>;
          setSimulatorState(prev => ({
            ...data,
            portfolio: data.portfolio || [],
            realizedGainLoss: data.realizedGainLoss || 0,
            totalCurrentValue: calculatePortfolioValue(data.portfolio || [], marketInfo?.stocks || []),
            totalGainLoss: calculateGainLoss(data.portfolio || [], marketInfo?.stocks || []),
            gainLossPercent: calculateGainLossPercent(data.portfolio || [], marketInfo?.stocks || [])
          }));
        } else {
          const initialState = { balance: 0, portfolio: [], totalInvested: 0, realizedGainLoss: 0 };
          await setDoc(stateRef, initialState, { merge: true });
        }
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to initialize state listener');
      setLoading(false);
    }

    return () => { if (stateUnsubscribe.current) stateUnsubscribe.current(); };
  }, [user, db, marketInfo]);

  // ── 5. Math Calculations ──
  const calculatePortfolioValue = (portfolio: PortfolioItem[], stocks: Stock[]): number => {
    const total = portfolio.reduce((sum, item) => {
      const stock = stocks.find(s => s.symbol === item.symbol);
      if (!stock || !stock.ltp || stock.ltp <= 0 || stock.ltp > 100000) return sum;
      return moneyAdd(sum, moneyMultiply(stock.ltp, item.quantity));
    }, 0);
    return roundMoney(total);
  };

  const calculateGainLoss = (portfolio: PortfolioItem[], stocks: Stock[]): number => {
    const currentValue = calculatePortfolioValue(portfolio, stocks);
    const invested = portfolio.reduce((total, item) => moneyAdd(total, item.totalCost), 0);
    return roundMoney(moneySubtract(currentValue, invested));
  };

  const calculateGainLossPercent = (portfolio: PortfolioItem[], stocks: Stock[]): number => {
    const invested = portfolio.reduce((total, item) => moneyAdd(total, item.totalCost), 0);
    if (invested === 0) return 0;
    return roundMoney((calculateGainLoss(portfolio, stocks) / invested) * 100);
  };

  const isMarketOpen = useCallback(() => {
    // 1. Force Open if we are in the Preview Environment
    if (process.env.NEXT_PUBLIC_IS_PREVIEW_MODE === 'true') {
      return true;
    }

    // 2. Standard Production Logic
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    const hour = bdTime.getUTCHours();
    const minute = bdTime.getUTCMinutes();
    const dayOfWeek = bdTime.getUTCDay();
    
    const dateStr = `${bdTime.getUTCFullYear()}-${String(bdTime.getUTCMonth() + 1).padStart(2, '0')}-${String(bdTime.getUTCDate()).padStart(2, '0')}`;

    if (dayOfWeek === 5 || dayOfWeek === 6 || bangladeshHolidays.includes(dateStr)) return false;
    return (hour >= 10 && (hour < 14 || (hour === 14 && minute <= 15)));
  }, [bangladeshHolidays]);

  // ── 6. UNIFIED TRADE EXECUTION ENGINE ──
  // Trade math/writes now happen server-side (app/api/simulator/trade) via
  // an Admin SDK transaction that re-derives the price from Firestore
  // itself — this hook no longer computes or writes balance/portfolio.
  // Everything below before the fetch is fast client-side UX pre-validation
  // only; the server route re-checks all of it authoritatively and is the
  // real gate. The resulting balance/portfolio changes arrive back through
  // the onSnapshot listener in step 4 above, same as before.
  const executeTrade = useCallback(async (symbol: string, type: 'BUY' | 'SELL', quantity: number) => {
    if (!user || !marketInfo) {
      setTransactionStatus('error');
      setTransactionMessage('User not authenticated or market data not loaded');
      throw new Error('Not authenticated');
    }

    if (!isMarketOpen()) {
      setTransactionStatus('error');
      setTransactionMessage('Market is closed. Orders are only allowed during market hours (10:00 AM - 2:15 PM).');
      throw new Error('Market Closed');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setTransactionStatus('error');
      setTransactionMessage('Quantity must be a positive integer');
      throw new Error('Invalid Quantity');
    }

    const stock = marketInfo.stocks.find(s => s.symbol === symbol);
    if (!stock || stock.ltp <= 0) {
      setTransactionStatus('error');
      setTransactionMessage('Stock not found or invalid price');
      throw new Error('Invalid Stock');
    }

    setTransactionStatus('processing');
    setTransactionMessage(`Processing ${type} order for ${quantity} shares...`);

    try {
      const response = await fetchWithFreshToken('/api/simulator/trade', {
        method: 'POST',
        body: JSON.stringify({ symbol, type, quantity }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.error || `Failed to execute ${type} order.`);
      }

      setTransactionStatus('success');
      setTransactionMessage(json.message || `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}.`);

    } catch (err: any) {
      console.error(`[Trade Engine] ${type} error:`, err);
      setTransactionStatus('error');
      setTransactionMessage(err.message || `Failed to execute ${type} order.`);
    }
  }, [user, marketInfo, isMarketOpen]);

  const resetTransaction = useCallback(() => {
    setTransactionStatus('idle');
    setTransactionMessage('');
  }, []);

  return {
    marketInfo,
    simulatorState,
    loading,
    error,
    transactionStatus,
    transactionMessage,
    executeTrade,
    isMarketOpen,
    resetTransaction,
    nextUpdateIn // <-- EXPORTING THE TIMER
  };
};