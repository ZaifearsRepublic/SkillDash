'use client';

// components/portfolio/PortfolioInsights.tsx
// Second-order figures that genuinely help someone learning to trade:
// lifetime result (realized + unrealized), concentration risk, today's
// biggest mover, and the real cost of activity (commission paid). All
// derived from data the app already fetches — see lib/utils/portfolio.ts's
// getPortfolioInsights for the exact math and its data-availability caveats.
import React from 'react';
import Link from 'next/link';
import { PieChart, Building2, Landmark, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import type { PortfolioInsights as Insights } from '@/lib/utils/portfolio';

const fmt = (n: number, dp = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });

const CATEGORY_COLOR: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-amber-500',
  N: 'bg-blue-500',
  Z: 'bg-rose-500',
  Other: 'bg-gray-400',
};

// Sector names come from lankabd.com (~21 possible values, not a fixed small
// set like category), so there's no single canonical color per name — cycle
// a fixed palette by rank order instead. "Other" (no sector data yet) always
// gets the same neutral gray regardless of rank.
const SECTOR_PALETTE = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
];

export default function PortfolioInsights({ insights }: { insights: Insights }) {
  const {
    totalPnl, realizedGainLoss, topHolding, categoryBreakdown, sectorBreakdown,
    lifetimeCommission, bestMoverToday, worstMoverToday,
  } = insights;

  return (
    <div className="space-y-3">
      {/* Realized vs Total — the number that separates paper gains from banked ones */}
      <div className="bg-white dark:bg-[#1A1F26] border sm:rounded-2xl border-gray-200 dark:border-gray-800 p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            <Landmark className="w-3 h-3" /> Realized P&L
          </div>
          <div className={`font-mono font-bold text-base tabular-nums ${realizedGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {realizedGainLoss >= 0 ? '+' : '−'}৳{fmt(Math.abs(realizedGainLoss))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Banked from closed trades</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
            Lifetime Result
          </div>
          <div className={`font-mono font-bold text-base tabular-nums ${totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {totalPnl >= 0 ? '+' : '−'}৳{fmt(Math.abs(totalPnl))}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Realized + unrealized</p>
        </div>
      </div>

      {/* Today's movers */}
      {(bestMoverToday || worstMoverToday) && (
        <div className="bg-white dark:bg-[#1A1F26] border sm:rounded-2xl border-gray-200 dark:border-gray-800 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
            Today&apos;s Movers
          </div>
          <div className="flex gap-3">
            {bestMoverToday && (
              <Link
                href={`/stocks/${bestMoverToday.symbol.toLowerCase()}`}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{bestMoverToday.symbol}</div>
                  <div className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    +৳{fmt(Math.abs(bestMoverToday.dayPnl))}
                  </div>
                </div>
              </Link>
            )}
            {worstMoverToday && (
              <Link
                href={`/stocks/${worstMoverToday.symbol.toLowerCase()}`}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 transition-colors"
              >
                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{worstMoverToday.symbol}</div>
                  <div className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                    −৳{fmt(Math.abs(worstMoverToday.dayPnl))}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Diversification — category breakdown + concentration flag */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-[#1A1F26] border sm:rounded-2xl border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
            <PieChart className="w-3 h-3" /> Diversification
          </div>

          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2.5">
            {categoryBreakdown.map((c) => (
              <span
                key={c.category}
                className={CATEGORY_COLOR[c.category] || CATEGORY_COLOR.Other}
                style={{ flexGrow: c.value }}
                title={`Category ${c.category}: ${c.percent.toFixed(1)}%`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            {categoryBreakdown.map((c) => (
              <div key={c.category} className="flex items-center gap-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${CATEGORY_COLOR[c.category] || CATEGORY_COLOR.Other}`} />
                <span className="font-semibold text-gray-600 dark:text-gray-300">Cat {c.category}</span>
                <span className="font-mono text-gray-400 dark:text-gray-500">{c.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {topHolding && topHolding.percent >= 40 && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded-lg px-2.5 py-1.5 mt-1">
              {topHolding.symbol} alone is {topHolding.percent.toFixed(0)}% of your holdings — a single stock moving
              hard will move your whole portfolio with it.
            </p>
          )}
        </div>
      )}

      {/* Industry exposure — same shape as Diversification, grouped by
          sector instead of DSE market category */}
      {sectorBreakdown.length > 0 && (
        <div className="bg-white dark:bg-[#1A1F26] border sm:rounded-2xl border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
            <Building2 className="w-3 h-3" /> Industry Exposure
          </div>

          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2.5">
            {sectorBreakdown.map((s, i) => (
              <span
                key={s.sector}
                className={s.sector === 'Other' ? 'bg-gray-400' : SECTOR_PALETTE[i % SECTOR_PALETTE.length]}
                style={{ flexGrow: s.value }}
                title={`${s.sector}: ${s.percent.toFixed(1)}%`}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {sectorBreakdown.map((s, i) => (
              <div key={s.sector} className="flex items-center gap-1.5 text-xs min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${s.sector === 'Other' ? 'bg-gray-400' : SECTOR_PALETTE[i % SECTOR_PALETTE.length]}`}
                />
                <span className="font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={s.sector}>
                  {s.sector}
                </span>
                <span className="font-mono text-gray-400 dark:text-gray-500 shrink-0">{s.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifetime cost of activity */}
      {lifetimeCommission > 0 && (
        <div className="bg-white dark:bg-[#1A1F26] border sm:rounded-2xl border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Commission paid to date</div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">0.4% per trade, buy and sell</div>
            </div>
          </div>
          <div className="font-mono font-bold text-sm text-gray-900 dark:text-white">৳{fmt(lifetimeCommission)}</div>
        </div>
      )}
    </div>
  );
}
