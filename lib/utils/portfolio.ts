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

/**
 * A holding's contribution to today's P&L. `stock.change` is LTP minus
 * YESTERDAY's close — correct for shares that were already held at
 * yesterday's close, but wrong for shares bought TODAY, whose real
 * "since-owned" baseline is their purchase price, not YCP. Naively
 * multiplying the whole quantity by `stock.change` overstates or understates
 * a fresh buy's day P&L by the gap between YCP and the actual buy price.
 *
 * Lots only record quantity + purchaseDate (see getLots), not a per-lot
 * price, so today's-lot cost can't be recovered exactly when it's blended
 * with an older lot. `averageBuyPrice` is used as the best available stand-in
 * for today's portion — exact for a same-day-only holding, an approximation
 * only when today's purchase topped up an existing pre-today position.
 */
export function getDayPnl(item: PortfolioItem, stock: Stock | undefined, now: Date = new Date()): number {
  if (!stock || stock.traded === false) return 0;
  const saleable = getSaleableQuantity(item, now); // held before today
  const boughtToday = item.quantity - saleable;
  const fromOlderShares = moneyMultiply(getDayChange(stock), saleable);
  const fromTodaysShares = moneyMultiply(stock.ltp - item.averageBuyPrice, boughtToday);
  return roundMoney(moneyAdd(fromOlderShares, fromTodaysShares));
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
  sector?: string;
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
    dayPnl: getDayPnl(item, stock, now),
    dayChangePercent: stock && stock.traded !== false ? stock.changePercent : 0,
    traded: stock?.traded !== false,
    category: stock?.category,
    sector: stock?.sector,
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

export interface PortfolioInsights {
  /** Realized + unrealized — the true lifetime trading result, cash-in-hand aside. */
  totalPnl: number;
  realizedGainLoss: number;
  /** Largest single holding as a share of total holdings value — a concentration/risk signal. */
  topHolding: { symbol: string; percent: number } | null;
  /** Holdings value grouped by DSE market category (A/B/N/Z), as a percent of total. */
  categoryBreakdown: { category: string; percent: number; value: number }[];
  /** Holdings value grouped by industry sector (see api/lanka_sector_sync.py), as a percent of total. */
  sectorBreakdown: { sector: string; percent: number; value: number }[];
  /** Sum of every commission paid across all executed trades — the real cost of activity. */
  lifetimeCommission: number;
  bestMoverToday: { symbol: string; dayPnl: number } | null;
  worstMoverToday: { symbol: string; dayPnl: number } | null;
}

/**
 * Second-order figures for the Portfolio screen, computed from data already
 * on hand: `getPortfolioTotals`' holdings, the account's persisted
 * `realizedGainLoss` (app/api/simulator/trade/route.ts is the only writer),
 * and trade history for lifetime commission. None of this requires new
 * backend work — it was sitting unused in fields the UI already fetches.
 */
export function getPortfolioInsights(
  totals: PortfolioTotals,
  realizedGainLoss: number,
  trades: { commission: number }[]
): PortfolioInsights {
  const { holdings, currentValue } = totals;

  let topHolding: PortfolioInsights['topHolding'] = null;
  if (holdings.length > 0 && currentValue > 0) {
    const top = holdings.reduce((max, h) => (h.marketValue > max.marketValue ? h : max), holdings[0]);
    topHolding = { symbol: top.symbol, percent: roundMoney((top.marketValue / currentValue) * 100) };
  }

  const byCategory = new Map<string, number>();
  for (const h of holdings) {
    const key = h.category || 'Other';
    byCategory.set(key, (byCategory.get(key) || 0) + h.marketValue);
  }
  const categoryBreakdown = Array.from(byCategory.entries())
    .map(([category, value]) => ({
      category,
      value: roundMoney(value),
      percent: currentValue > 0 ? roundMoney((value / currentValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const bySector = new Map<string, number>();
  for (const h of holdings) {
    const key = h.sector || 'Other';
    bySector.set(key, (bySector.get(key) || 0) + h.marketValue);
  }
  const sectorBreakdown = Array.from(bySector.entries())
    .map(([sector, value]) => ({
      sector,
      value: roundMoney(value),
      percent: currentValue > 0 ? roundMoney((value / currentValue) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const lifetimeCommission = roundMoney(trades.reduce((sum, t) => moneyAdd(sum, t.commission || 0), 0));

  let bestMoverToday: PortfolioInsights['bestMoverToday'] = null;
  let worstMoverToday: PortfolioInsights['worstMoverToday'] = null;
  for (const h of holdings) {
    if (!h.traded) continue;
    if (!bestMoverToday || h.dayPnl > bestMoverToday.dayPnl) bestMoverToday = { symbol: h.symbol, dayPnl: h.dayPnl };
    if (!worstMoverToday || h.dayPnl < worstMoverToday.dayPnl) worstMoverToday = { symbol: h.symbol, dayPnl: h.dayPnl };
  }
  // A single mover shouldn't be reported as both best and worst.
  if (bestMoverToday && worstMoverToday && bestMoverToday.symbol === worstMoverToday.symbol) {
    worstMoverToday = null;
  }

  return {
    totalPnl: roundMoney(totals.unrealisedPnl + realizedGainLoss),
    realizedGainLoss: roundMoney(realizedGainLoss),
    topHolding,
    categoryBreakdown,
    sectorBreakdown,
    lifetimeCommission,
    bestMoverToday,
    worstMoverToday,
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
