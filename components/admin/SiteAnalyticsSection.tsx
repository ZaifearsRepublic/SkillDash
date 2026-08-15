'use client';

import { useMemo, useState, type ReactNode, type MouseEvent } from 'react';
import Link from 'next/link';
import { Users, Clock, UserPlus, Coins, TrendingUp, TrendingDown, Compass, Activity, ArrowRight } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────

interface DailyTrendPoint {
  dateKey: string;
  sessions: number;
  avgSeconds: number;
}

interface UserRow {
  uid: string;
  name: string;
  email: string | null;
  visitCount: number;
  totalActiveSeconds: number;
  lastVisitAt: string | null;
  createdAt?: string | null;
}

interface CoinRow {
  uid: string;
  name: string;
  email: string | null;
  coins: number;
}

interface StockRow {
  symbol: string;
  count: number;
}

interface PageRow {
  path: string;
  views: number;
}

interface TradingActivity {
  trades: { today: number; last7Days: number; last30Days: number };
  activeTraders: { today: number; last7Days: number; last30Days: number };
  buyVsSell: { buys: number; sells: number };
  mostTradedStocks: StockRow[];
  truncated: boolean;
}

export interface SiteAnalyticsData {
  visitors: { today: number; last7Days: number; last30Days: number };
  avgSessionSeconds: { today: number; last7Days: number };
  registrations: { today: number; last7Days: number; last30Days: number };
  deviceBreakdown: { mobile: number; tablet: number; desktop: number; unknown: number };
  dailyTrend: DailyTrendPoint[];
  trafficSources: Record<'direct' | 'internal' | 'search_google' | 'search_other' | 'social' | 'other', number>;
  newVsReturning: { new: number; returning: number };
  bounceRate: number;
  peakHours: { hour: number; sessions: number }[];
  topLandingPages: PageRow[];
  topCoinHolders: CoinRow[];
  totalCoinsInCirculation: number | null;
  mostActiveUsers: UserRow[];
  leastActiveUsers: UserRow[];
  trading: TradingActivity | null;
  tradingError?: string | null;
  methodologyNote?: string;
}

// ── Formatting helpers ────────────────────────────────────────────────

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString();
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0s';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'Never visited';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 'Never visited';
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function formatDateShort(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// ── Stat tile ──────────────────────────────────────────────────────────

const ACCENT_CLASSES = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
} as const;

function StatTile({
  label,
  value,
  sublabel,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent: keyof typeof ACCENT_CLASSES;
  icon: ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{label}</p>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {sublabel && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{sublabel}</p>}
        </div>
        <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${ACCENT_CLASSES[accent]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Icons — lucide-react, matching the icon set the homepage/coins page use ─

const Icon = {
  Users: () => <Users className="w-4 h-4" />,
  Clock: () => <Clock className="w-4 h-4" />,
  UserPlus: () => <UserPlus className="w-4 h-4" />,
  Coin: () => <Coins className="w-4 h-4" />,
  TrendUp: () => <TrendingUp className="w-4 h-4" />,
  TrendDown: () => <TrendingDown className="w-4 h-4" />,
  Compass: () => <Compass className="w-4 h-4" />,
  Activity: () => <Activity className="w-4 h-4" />,
};

// ── 30-day visits trend — hand-built SVG line + area, no chart library ──

function TrendChart({ data }: { data: DailyTrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, maxY, gridValues, width, height, padding } = useMemo(() => {
    const width = 720;
    const height = 200;
    const padding = { top: 16, right: 12, bottom: 26, left: 34 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    const rawMax = Math.max(...data.map((d) => d.sessions), 1);
    // Round the axis ceiling up to a "clean" step so gridline labels are tidy.
    const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(rawMax))));
    const niceMax = Math.ceil(rawMax / (magnitude / 2 || 1)) * (magnitude / 2 || 1) || rawMax;
    const maxY = Math.max(niceMax, 4);

    const n = Math.max(data.length - 1, 1);
    const points = data.map((d, i) => ({
      ...d,
      x: padding.left + (i / n) * plotW,
      y: padding.top + plotH - (d.sessions / maxY) * plotH,
    }));

    const gridValues = [0, 0.5, 1].map((f) => Math.round(maxY * f));

    return { points, maxY, gridValues, width, height, padding };
  }, [data]);

  if (data.length === 0 || points.every((p) => p.sessions === 0)) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-gray-400 dark:text-gray-500">
        No visits recorded yet
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${height - padding.bottom} L ${points[0].x.toFixed(1)},${height - padding.bottom} Z`;
  const bottomY = height - padding.bottom;
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  const handleMove = (e: MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const n = points.length;
    const plotW = width - padding.left - padding.right;
    let idx = Math.round(((relX - padding.left) / plotW) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    setHoverIndex(idx);
  };

  // Keep the in-SVG tooltip from running off the right edge.
  const tooltipW = 118;
  const tooltipFlip = hovered ? hovered.x + 10 + tooltipW > width : false;
  const tooltipX = hovered ? (tooltipFlip ? hovered.x - 10 - tooltipW : hovered.x + 10) : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-[200px]"
      role="img"
      aria-label="Visits over the last 30 days"
    >
      {/* Gridlines */}
      {gridValues.map((v, i) => {
        const y = padding.top + (height - padding.top - padding.bottom) * (1 - v / maxY);
        return (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
              className="text-gray-200 dark:text-gray-800"
            />
            <text x={padding.left - 6} y={y + 3} textAnchor="end" className="fill-gray-400 dark:fill-gray-500" fontSize="9">
              {formatCompact(v)}
            </text>
          </g>
        );
      })}

      {/* Area wash + line */}
      <path d={areaPath} className="fill-blue-500/10" />
      <path d={linePath} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Endpoint marker + value label (today) */}
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} className="fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-[#111]" strokeWidth={2} />
      <text
        x={points[points.length - 1].x}
        y={Math.max(points[points.length - 1].y - 10, 10)}
        textAnchor="end"
        className="fill-gray-700 dark:fill-gray-200 font-semibold"
        fontSize="11"
      >
        {points[points.length - 1].sessions}
      </text>

      {/* X-axis: sparse date labels */}
      {points
        .filter((_, i) => i % Math.ceil(points.length / 6) === 0 || i === points.length - 1)
        .map((p, i) => (
          <text key={i} x={p.x} y={height - 8} textAnchor="middle" className="fill-gray-400 dark:fill-gray-500" fontSize="9">
            {formatDateShort(p.dateKey)}
          </text>
        ))}

      {/* Hover layer */}
      {hovered && (
        <g>
          <line x1={hovered.x} x2={hovered.x} y1={padding.top} y2={bottomY} stroke="currentColor" strokeWidth={1} className="text-gray-300 dark:text-gray-700" />
          <circle cx={hovered.x} cy={hovered.y} r={5} className="fill-blue-600 dark:fill-blue-400 stroke-white dark:stroke-[#111]" strokeWidth={2} />
          <g transform={`translate(${tooltipX}, ${Math.max(hovered.y - 40, padding.top)})`}>
            <rect width={tooltipW} height={40} rx={8} className="fill-gray-900 dark:fill-black" opacity={0.95} />
            <text x={10} y={16} className="fill-white" fontSize="10" fontWeight={600}>
              {formatDateShort(hovered.dateKey)}
            </text>
            <text x={10} y={30} className="fill-gray-300" fontSize="9">
              {hovered.sessions} visits · {formatDuration(hovered.avgSeconds)} avg
            </text>
          </g>
        </g>
      )}

      {/* Transparent hit-area for mouse tracking */}
      <rect
        x={padding.left}
        y={padding.top}
        width={width - padding.left - padding.right}
        height={height - padding.top - padding.bottom}
        fill="transparent"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      />
    </svg>
  );
}

// ── Device breakdown — compact stacked bar (part-to-whole, 3 categories) ─

interface Segment {
  key: string;
  label: string;
  value: number;
  className: string;
}

// Generic part-to-whole bar — a legend is always shown (per the dataviz
// guide, identity is never color-alone), segments separated by a surface gap.
function SegmentBar({ segments, emptyText }: { segments: Segment[]; emptyText: string }) {
  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">{emptyText}</p>;
  }

  return (
    <div>
      <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5">
        {visible.map((s) => (
          <div
            key={s.key}
            className={s.className}
            style={{ width: `${(s.value / total) * 100}%` }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {visible.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className={`w-2 h-2 rounded-full ${s.className}`} />
            {s.label} · {Math.round((s.value / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceBreakdown({ breakdown }: { breakdown: SiteAnalyticsData['deviceBreakdown'] }) {
  return (
    <SegmentBar
      emptyText="No device data yet"
      segments={[
        { key: 'mobile', label: 'Mobile', value: breakdown.mobile, className: 'bg-blue-600 dark:bg-blue-500' },
        { key: 'desktop', label: 'Desktop', value: breakdown.desktop, className: 'bg-indigo-500 dark:bg-indigo-400' },
        { key: 'tablet', label: 'Tablet', value: breakdown.tablet, className: 'bg-emerald-500 dark:bg-emerald-400' },
      ]}
    />
  );
}

function NewVsReturningBar({ data }: { data: SiteAnalyticsData['newVsReturning'] }) {
  return (
    <SegmentBar
      emptyText="No visitor data yet"
      segments={[
        { key: 'new', label: 'New', value: data.new, className: 'bg-blue-600 dark:bg-blue-500' },
        { key: 'returning', label: 'Returning', value: data.returning, className: 'bg-emerald-500 dark:bg-emerald-400' },
      ]}
    />
  );
}

function BuyVsSellBar({ data }: { data: { buys: number; sells: number } }) {
  return (
    <SegmentBar
      emptyText="No trades yet"
      segments={[
        { key: 'buys', label: 'Buy orders', value: data.buys, className: 'bg-green-600 dark:bg-green-500' },
        { key: 'sells', label: 'Sell orders', value: data.sells, className: 'bg-red-500 dark:bg-red-400' },
      ]}
    />
  );
}

// ── Traffic sources — magnitude comparison across categories, single hue ─

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  internal: 'Internal',
  search_google: 'Google',
  search_other: 'Other search',
  social: 'Social',
  other: 'Other',
};

function HorizontalBarList({ rows, emptyText }: { rows: { label: string; value: number }[]; emptyText: string }) {
  const filtered = rows.filter((r) => r.value > 0);
  const max = Math.max(...filtered.map((r) => r.value), 1);
  if (filtered.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">{emptyText}</p>;
  }
  return (
    <ul className="space-y-2.5">
      {filtered.map((r) => (
        <li key={r.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 truncate">{r.label}</span>
          <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
              style={{ width: `${Math.max((r.value / max) * 100, 3)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 w-10 text-right shrink-0">
            {formatCompact(r.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Meter — a single ratio against a limit (bounce rate) ─────────────────

function Meter({ value, label, goodBelow, warnBelow }: { value: number; label: string; goodBelow: number; warnBelow: number }) {
  const tone =
    value <= goodBelow
      ? { fill: 'bg-green-600 dark:bg-green-500', text: 'text-green-600 dark:text-green-400', word: 'Healthy' }
      : value <= warnBelow
      ? { fill: 'bg-amber-500 dark:bg-amber-400', text: 'text-amber-600 dark:text-amber-400', word: 'Watch' }
      : { fill: 'bg-red-500 dark:bg-red-400', text: 'text-red-600 dark:text-red-400', word: 'High' };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}%</span>
        <span className={`text-xs font-semibold ${tone.text}`}>{tone.word}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${tone.fill}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">{label}</p>
    </div>
  );
}

// ── Peak activity hours — 24 single-hue bars ──────────────────────────────

function PeakHoursChart({ hours }: { hours: { hour: number; sessions: number }[] }) {
  const max = Math.max(...hours.map((h) => h.sessions), 1);
  if (hours.every((h) => h.sessions === 0)) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">No activity data yet</p>;
  }
  const formatHour = (h: number) => {
    const period = h < 12 ? 'am' : 'pm';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}${period}`;
  };
  return (
    <div>
      <div className="flex items-end gap-[3px] h-24">
        {hours.map((h) => (
          <div
            key={h.hour}
            className="flex-1 rounded-t bg-blue-600 dark:bg-blue-500 min-h-[2px]"
            style={{ height: `${Math.max((h.sessions / max) * 100, 2)}%` }}
            title={`${formatHour(h.hour)}: ${h.sessions} visits`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>11pm</span>
      </div>
    </div>
  );
}

// ── Simple ranked list (top pages / most-traded stocks) ──────────────────

function RankedListCard({
  title,
  icon,
  accent,
  rows,
  emptyText,
}: {
  title: string;
  icon: ReactNode;
  accent: keyof typeof ACCENT_CLASSES;
  rows: { label: string; value: string }[];
  emptyText: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${ACCENT_CLASSES[accent]}`}>{icon}</div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 dark:border-gray-900 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-semibold text-gray-300 dark:text-gray-600 w-4 shrink-0">{i + 1}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 shrink-0">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── User list card (most / least active) ─────────────────────────────────

function UserListCard({
  title,
  icon,
  accent,
  users,
  emptyText,
  metricLabel,
  viewAllHref,
}: {
  title: string;
  icon: ReactNode;
  accent: keyof typeof ACCENT_CLASSES;
  users: UserRow[];
  emptyText: string;
  metricLabel: (u: UserRow) => string;
  viewAllHref?: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${ACCENT_CLASSES[accent]}`}>{icon}</div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:gap-1.5 transition-all shrink-0">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {users.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {users.map((u, i) => (
            <li key={u.uid} className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 dark:border-gray-900 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-semibold text-gray-300 dark:text-gray-600 w-4 shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                  {u.email && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{u.email}</p>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{metricLabel(u)}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{timeAgo(u.lastVisitAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CoinLeaderboardCard({ users, viewAllHref }: { users: CoinRow[]; viewAllHref?: string }) {
  return (
    <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${ACCENT_CLASSES.amber}`}>
            <Icon.Coin />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Coin Holders</h3>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:gap-1.5 transition-all shrink-0">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {users.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No users with coins yet</p>
      ) : (
        <ul className="space-y-1">
          {users.map((u, i) => (
            <li key={u.uid} className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 dark:border-gray-900 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-semibold text-gray-300 dark:text-gray-600 w-4 shrink-0">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                  {u.email && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{u.email}</p>}
                </div>
              </div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                {formatCompact(u.coins)} <span className="text-gray-400 dark:text-gray-500 font-normal">coins</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Section root ──────────────────────────────────────────────────────

export default function SiteAnalyticsSection({
  data,
  loading,
  error,
}: {
  data: SiteAnalyticsData | null;
  loading: boolean;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[92px] rounded-3xl bg-gray-100 dark:bg-[#1A1F26] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-[#1A1F26] border border-red-100 dark:border-red-500/20 rounded-3xl p-5">
        <p className="text-sm text-red-600 dark:text-red-400">{error || 'Site analytics unavailable right now.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Visits KPI row */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon.TrendUp />
          Site Visits
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile label="Visits today" value={formatCompact(data.visitors.today)} accent="blue" icon={<Icon.Users />} />
          <StatTile label="Last 7 days" value={formatCompact(data.visitors.last7Days)} accent="blue" icon={<Icon.Users />} />
          <StatTile label="Last 30 days" value={formatCompact(data.visitors.last30Days)} accent="blue" icon={<Icon.Users />} />
          <StatTile
            label="Avg time on site"
            value={formatDuration(data.avgSessionSeconds.today || data.avgSessionSeconds.last7Days)}
            sublabel={`${formatDuration(data.avgSessionSeconds.last7Days)} avg (7d)`}
            accent="green"
            icon={<Icon.Clock />}
          />
        </div>
      </div>

      {/* Trend chart + device split */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4">
        <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Visits — last 30 days</h3>
          <TrendChart data={data.dailyTrend} />
        </div>
        <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Device split (30d)</h3>
          <DeviceBreakdown breakdown={data.deviceBreakdown} />
        </div>
      </div>

      {/* Traffic sources, visitor loyalty, bounce rate */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon.Compass />
          Traffic & Engagement Quality
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Traffic sources (30d)</h3>
            <HorizontalBarList
              emptyText="No traffic data yet"
              rows={Object.entries(data.trafficSources).map(([key, value]) => ({
                label: SOURCE_LABELS[key] || key,
                value,
              }))}
            />
          </div>
          <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">New vs returning visitors (30d)</h3>
            <NewVsReturningBar data={data.newVsReturning} />
          </div>
          <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Bounce rate (7d)</h3>
            <Meter
              value={data.bounceRate}
              label="Sessions with 1 page view and ≤10s active time"
              goodBelow={40}
              warnBelow={60}
            />
          </div>
        </div>
      </div>

      {/* Peak hours + top landing pages */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-4">
        <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Peak activity hours (7d, Dhaka time)</h3>
          <PeakHoursChart hours={data.peakHours} />
        </div>
        <RankedListCard
          title="Top Landing Pages"
          icon={<Icon.Compass />}
          accent="purple"
          rows={data.topLandingPages.map((p) => ({ label: p.path, value: formatCompact(p.views) }))}
          emptyText="No page view data yet"
        />
      </div>

      {/* Registrations KPI row */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon.UserPlus />
          New Registrations
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <StatTile label="Today" value={formatCompact(data.registrations.today)} accent="indigo" icon={<Icon.UserPlus />} />
          <StatTile label="Last 7 days" value={formatCompact(data.registrations.last7Days)} accent="indigo" icon={<Icon.UserPlus />} />
          <StatTile label="Last 30 days" value={formatCompact(data.registrations.last30Days)} accent="indigo" icon={<Icon.UserPlus />} />
        </div>
      </div>

      {/* Engagement — who's active, who's gone quiet, who's rich */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon.Users />
          Engagement
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <UserListCard
            title="Most Active Users"
            icon={<Icon.TrendUp />}
            accent="green"
            users={data.mostActiveUsers}
            emptyText="No visit data yet"
            metricLabel={(u) => `${u.visitCount} visits`}
            viewAllHref="/admin/users/most-active"
          />
          <UserListCard
            title="Going Quiet"
            icon={<Icon.TrendDown />}
            accent="amber"
            users={data.leastActiveUsers}
            emptyText="Not enough data yet"
            metricLabel={(u) => `${u.visitCount} visits`}
            viewAllHref="/admin/users/going-quiet"
          />
          <CoinLeaderboardCard users={data.topCoinHolders} viewAllHref="/admin/users/top-coin-holders" />
        </div>
      </div>

      {/* Trading activity — the metric most specific to a paper-trading simulator */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon.Activity />
          Trading Activity
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatTile
            label="Trades today"
            value={formatCompact(data.trading?.trades.today ?? 0)}
            accent="green"
            icon={<Icon.Activity />}
          />
          <StatTile
            label="Trades (7d)"
            value={formatCompact(data.trading?.trades.last7Days ?? 0)}
            accent="green"
            icon={<Icon.Activity />}
          />
          <StatTile
            label="Active traders (7d)"
            value={formatCompact(data.trading?.activeTraders.last7Days ?? 0)}
            sublabel={`${formatCompact(data.trading?.activeTraders.today ?? 0)} today`}
            accent="blue"
            icon={<Icon.Users />}
          />
          <StatTile
            label="Coins in circulation"
            value={data.totalCoinsInCirculation != null ? formatCompact(data.totalCoinsInCirculation) : '—'}
            accent="amber"
            icon={<Icon.Coin />}
          />
        </div>

        {data.tradingError ? (
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-3xl p-4">
            {data.tradingError}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[40fr_60fr] gap-4">
            <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Buy vs sell orders (30d)</h3>
              <BuyVsSellBar data={data.trading?.buyVsSell ?? { buys: 0, sells: 0 }} />
            </div>
            <RankedListCard
              title="Most Traded Stocks (30d)"
              icon={<Icon.TrendUp />}
              accent="purple"
              rows={(data.trading?.mostTradedStocks ?? []).map((s) => ({ label: s.symbol, value: `${formatCompact(s.count)} trades` }))}
              emptyText="No trades yet"
            />
          </div>
        )}
        {data.trading?.truncated && (
          <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-2">
            Very high-volume windows are sampled from the most recent trades rather than fully counted.
          </p>
        )}
      </div>

      {data.methodologyNote && (
        <p className="text-[11px] text-gray-400 dark:text-gray-600 leading-relaxed">{data.methodologyNote}</p>
      )}
    </div>
  );
}
