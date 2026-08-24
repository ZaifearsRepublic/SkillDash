// lib/utils/portfolio.ts
// Client-side portfolio/holding math for the broker-style UI.
//
// The T+1 saleable calculation here is a deliberate MIRROR of the
// authoritative server logic in app/api/simulator/trade/route.ts (same
// getLots fallback, same Asia/Dhaka date comparison, same "shares bought
// today are excluded" rule). It exists so the UI can show a SALEABLE figure
// up front instead of letting the user discover the lockout only after the
// server rejects their order. It is NOT a gate — the server re-checks
// everything and remains the only authority.
import { moneyAdd, moneyMultiply, roundMoney, COMMISSION_RATE } from './money';
import type { Stock, PortfolioItem } from '@/hooks/useSimulator';

export interface Lot {
  quantity: number;
  purchaseDate: string;
}

/** Same Asia/Dhaka YYYY-MM-DD key the trade route compares lots on. */
export function dhakaDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

/**
 * Portfolio items predating the lots migration only carry one aggregate
 * `purchaseDate`; treat the whole holding as a single lot dated by it.
 * Mirrors getLots() in app/api/simulator/trade/route.ts.
 */
export function getLots(item: PortfolioItem): Lot[] {
  return item.lots && item.lots.length > 0
    ? item.lots
    : [{ quantity: item.quantity, purchaseDate: item.purchaseDate }];
}

/**
 * Shares that have cleared T+1 and can be sold today. Shares bought today
 * are locked until tomorrow, even when merged into an older position.
 */
export function getSaleableQuantity(item: PortfolioItem, now: Date = new Date()): number {
  const today = dhakaDateStr(now.toISOString());
  return getLots(item).reduce(
    (sum, lot) => (dhakaDateStr(lot.purchaseDate) === today ? sum : sum + lot.quantity),
    0
  );
}

/**
 * The price a position should be valued at. A stock with zero matched trades
 * today reports ltp 0 (see api/market_sync.py) — valuing at that would read
 * as a 100% loss, so fall back to yesterday's close.
 */
export function getValuationPrice(stock: Stock | undefined): number {
  if (!stock) return 0;
  if (stock.traded !== false && stock.ltp > 0) return stock.ltp;
  return stock.ycp || 0;
}

/** Today's per-share price move, or 0 for a stock that never traded today. */
export function getDayChange(stock: Stock | undefined): number {
  if (!stock || stock.traded === false) return 0;
  return stock.change || 0;
}

export interface HoldingMetrics {
  symbol: string;
  quantity: number;
  saleable: number;
  locked: number;
  avgCost: number;
  /** Total amount originally paid, commission included. */
  cost: number;
  ltp: number;
  valuationPrice: number;
  marketValue: number;
  /** Market value minus cost. */
  pnl: number;
  pnlPercent: number;
  /** Today's move on this position only. */
  dayPnl: number;
  dayChangePercent: number;
  traded: boolean;
  category?: string;
}

export function getHoldingMetrics(
  item: PortfolioItem,
  stock: Stock | undefined,
  now: Date = new Date()
): HoldingMetrics {
  const valuationPrice = getValuationPrice(stock);
  const marketValue = roundMoney(moneyMultiply(valuationPrice, item.quantity));
  const cost = roundMoney(item.totalCost);
  const pnl = roundMoney(marketValue - cost);
  const dayChange = getDayChange(stock);
  const saleable = getSaleableQuantity(item, now);

  return {
    symbol: item.symbol,
    quantity: item.quantity,
    saleable,
    locked: item.quantity - saleable,
    avgCost: item.averageBuyPrice,
    cost,
    ltp: stock?.ltp ?? 0,
    valuationPrice,
    marketValue,
    pnl,
    pnlPercent: cost > 0 ? roundMoney((pnl / cost) * 100) : 0,
    dayPnl: roundMoney(moneyMultiply(dayChange, item.quantity)),
    dayChangePercent: stock && stock.traded !== false ? stock.changePercent : 0,
    traded: stock?.traded !== false,
    category: stock?.category,
  };
}

export interface PortfolioTotals {
  currentValue: number;
  investment: number;
  unrealisedPnl: number;
  unrealisedPercent: number;
  dayPnl: number;
  gainers: number;
  losers: number;
  unchanged: number;
  holdings: HoldingMetrics[];
}

export function getPortfolioTotals(
  portfolio: PortfolioItem[],
  stocks: Stock[],
  now: Date = new Date()
): PortfolioTotals {
  const bySymbol = new Map(stocks.map((s) => [s.symbol, s]));
  const holdings = portfolio.map((item) => getHoldingMetrics(item, bySymbol.get(item.symbol), now));

  let currentValue = 0;
  let investment = 0;
  let dayPnl = 0;
  let gainers = 0;
  let losers = 0;
  let unchanged = 0;

  for (const h of holdings) {
    currentValue = moneyAdd(currentValue, h.marketValue);
    investment = moneyAdd(investment, h.cost);
    dayPnl = moneyAdd(dayPnl, h.dayPnl);
    if (h.pnl > 0) gainers += 1;
    else if (h.pnl < 0) losers += 1;
    else unchanged += 1;
  }

  const unrealisedPnl = roundMoney(currentValue - investment);

  return {
    currentValue: roundMoney(currentValue),
    investment: roundMoney(investment),
    unrealisedPnl,
    unrealisedPercent: investment > 0 ? roundMoney((unrealisedPnl / investment) * 100) : 0,
    dayPnl: roundMoney(dayPnl),
    gainers,
    losers,
    unchanged,
    holdings,
  };
}

/** Advancers / decliners / unchanged across the whole board. */
export function getMarketBreadth(stocks: Stock[]) {
  let advancing = 0;
  let declining = 0;
  let unchanged = 0;
  let notTraded = 0;

  for (const s of stocks) {
    if (s.traded === false) {
      notTraded += 1;
    } else if (s.change > 0) {
      advancing += 1;
    } else if (s.change < 0) {
      declining += 1;
    } else {
      unchanged += 1;
    }
  }

  return { advancing, declining, unchanged, notTraded, total: stocks.length };
}

/** Total turnover across the board, in BDT. */
export function getTotalTurnover(stocks: Stock[]): number {
  return stocks.reduce((sum, s) => sum + (s.value || 0), 0);
}

export interface OrderEstimate {
  quantity: number;
  price: number;
  gross: number;
  commission: number;
  /** BUY: gross + commission. SELL: gross - commission. */
  net: number;
}

/**
 * Mirrors the commission math the server applies in
 * app/api/simulator/trade/route.ts so the order screen can preview the
 * exact figure the trade will settle at.
 */
export function estimateOrder(
  type: 'BUY' | 'SELL',
  quantity: number,
  price: number
): OrderEstimate {
  const gross = roundMoney(moneyMultiply(price, quantity));
  const commission = roundMoney(gross * COMMISSION_RATE);
  return {
    quantity,
    price,
    gross,
    commission,
    net: roundMoney(type === 'BUY' ? gross + commission : gross - commission),
  };
}
