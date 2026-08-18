'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchWithToken } from '@/lib/utils/fetchWithToken';
import {
  Search, Download, LayoutDashboard, Loader2, TrendingUp, TrendingDown, Coins, SlidersHorizontal, X,
} from 'lucide-react';

type ListType = 'most-active' | 'going-quiet' | 'top-coins';

interface UserRow {
  uid: string;
  name: string;
  email: string | null;
  visitCount?: number;
  totalActiveSeconds?: number;
  lastVisitAt?: string | null;
  coins?: number;
  createdAt?: string | null;
}

interface CsvColumn {
  key: string;
  header: string;
  value?: (row: UserRow) => any;
}

const ACCENT_CLASSES = {
  green: 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400',
} as const;

// Whole, inclusive days between an ISO timestamp and now — used for both the
// "Account Age" / "Inactive For" columns and their matching filters.
function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
}

function daysLabel(days: number | null): string {
  if (days === null) return 'Never';
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

const SHARED_ENGAGEMENT_COLUMNS: CsvColumn[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'visitCount', header: 'Visits (All-Time)' },
  { key: 'totalActiveSeconds', header: 'Total Active Seconds' },
  { key: 'lastVisitAt', header: 'Last Visit' },
  { key: 'createdAt', header: 'Joined' },
  { key: 'accountAgeDays', header: 'Account Age (days)', value: (r) => daysSince(r.createdAt) ?? '' },
  { key: 'inactiveDays', header: 'Inactive For (days)', value: (r) => daysSince(r.lastVisitAt) ?? 'Never' },
  { key: 'uid', header: 'User ID' },
];

const TYPE_CONFIG: Record<ListType, {
  title: string;
  description: string;
  icon: typeof TrendingUp;
  accent: keyof typeof ACCENT_CLASSES;
  metricLabel: string;
  metricKey: 'visitCount' | 'coins';
  metricFilterLabel: string;
  metricStep?: number;
  csvColumns: CsvColumn[];
  showInactivityColumns: boolean;
}> = {
  'most-active': {
    title: 'Most Active Users',
    description: 'Every registered user ranked by total visits, most first.',
    icon: TrendingUp,
    accent: 'green',
    metricLabel: 'Visits',
    metricKey: 'visitCount',
    metricFilterLabel: 'Visits',
    csvColumns: SHARED_ENGAGEMENT_COLUMNS,
    showInactivityColumns: false,
  },
  'going-quiet': {
    title: 'Going Quiet',
    description: 'Accounts at least 3 days old with the fewest visits — the users most worth re-engaging.',
    icon: TrendingDown,
    accent: 'amber',
    metricLabel: 'Visits',
    metricKey: 'visitCount',
    metricFilterLabel: 'Visits',
    csvColumns: SHARED_ENGAGEMENT_COLUMNS,
    showInactivityColumns: true,
  },
  'top-coins': {
    title: 'Top Coin Holders',
    description: 'Every user ranked by simulator balance — the BDT-equivalent virtual trading currency — highest first.',
    icon: Coins,
    accent: 'amber',
    metricLabel: 'Coins',
    metricKey: 'coins',
    metricFilterLabel: 'Balance (৳)',
    metricStep: 1000,
    csvColumns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'coins', header: 'Coins' },
      { key: 'createdAt', header: 'Joined' },
      { key: 'uid', header: 'User ID' },
    ],
    showInactivityColumns: false,
  },
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Quote/escape a CSV cell; a leading UTF-8 BOM is added by the caller so
// Bangla names open correctly in Excel instead of turning into mojibake.
function csvCell(value: any): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: UserRow[], columns: CsvColumn[]): string {
  const header = columns.map((c) => csvCell(c.header)).join(',');
  const lines = rows.map((r) => columns.map((c) => csvCell(c.value ? c.value(r) : (r as any)[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Local <input type="date"> yields "YYYY-MM-DD" in the browser's local
// timezone; comparing against ISO timestamps as plain strings works because
// both sort lexicographically the same as chronologically at day resolution.
function toDateInputValue(v: string): string {
  return v;
}

export default function UserExportList({ type }: { type: ListType }) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Filters ──
  const [minMetric, setMinMetric] = useState('');
  const [maxMetric, setMaxMetric] = useState('');
  const [joinedFrom, setJoinedFrom] = useState('');
  const [joinedTo, setJoinedTo] = useState('');
  const [minInactiveDays, setMinInactiveDays] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithToken(`/api/admin/user-list?type=${type}`, { method: 'GET' });
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || `Request failed (${response.status})`);
        }
        if (!cancelled) {
          setRows(json.rows || []);
          setTruncated(!!json.truncated);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load user list');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [type]);

  // Reset filters when switching between pages (most-active / going-quiet / top-coins).
  useEffect(() => {
    setSearchTerm('');
    setMinMetric('');
    setMaxMetric('');
    setJoinedFrom('');
    setJoinedTo('');
    setMinInactiveDays('');
  }, [type]);

  const activeFilterCount = [minMetric, maxMetric, joinedFrom, joinedTo, minInactiveDays].filter(
    (v) => v !== ''
  ).length;

  const clearFilters = () => {
    setMinMetric('');
    setMaxMetric('');
    setJoinedFrom('');
    setJoinedTo('');
    setMinInactiveDays('');
  };

  const filteredRows = useMemo(() => {
    let result = rows;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) => r.name?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term)
      );
    }

    const min = minMetric === '' ? null : Number(minMetric);
    const max = maxMetric === '' ? null : Number(maxMetric);
    if (min !== null && Number.isFinite(min)) {
      result = result.filter((r) => ((r as any)[config.metricKey] || 0) >= min);
    }
    if (max !== null && Number.isFinite(max)) {
      result = result.filter((r) => ((r as any)[config.metricKey] || 0) <= max);
    }

    if (joinedFrom) {
      result = result.filter((r) => r.createdAt && r.createdAt.slice(0, 10) >= joinedFrom);
    }
    if (joinedTo) {
      result = result.filter((r) => r.createdAt && r.createdAt.slice(0, 10) <= joinedTo);
    }

    if (config.showInactivityColumns && minInactiveDays !== '') {
      const minDays = Number(minInactiveDays);
      if (Number.isFinite(minDays)) {
        result = result.filter((r) => {
          const d = daysSince(r.lastVisitAt);
          return d === null || d >= minDays; // "never visited" always counts as inactive enough
        });
      }
    }

    return result;
  }, [rows, searchTerm, minMetric, maxMetric, joinedFrom, joinedTo, minInactiveDays, config.metricKey, config.showInactivityColumns]);

  const handleDownload = () => {
    const csv = toCsv(filteredRows, config.csvColumns);
    const datePart = new Date().toISOString().slice(0, 10);
    downloadCsv(`${type}-${datePart}.csv`, csv);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 bg-gray-50/50 dark:bg-[#090E17]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 dark:border-gray-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${ACCENT_CLASSES[config.accent]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {config.title}
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{config.description}</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-white dark:bg-[#1A1F26] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
              filtersOpen || activeFilterCount > 0
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400'
                : 'bg-white dark:bg-[#1A1F26] border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || filteredRows.length === 0}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:shadow-none whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Download CSV ({filteredRows.length.toLocaleString()})
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Min {config.metricFilterLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  step={config.metricStep || 1}
                  value={minMetric}
                  onChange={(e) => setMinMetric(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Max {config.metricFilterLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  step={config.metricStep || 1}
                  value={maxMetric}
                  onChange={(e) => setMaxMetric(e.target.value)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Joined after
                </label>
                <input
                  type="date"
                  value={toDateInputValue(joinedFrom)}
                  onChange={(e) => setJoinedFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Joined before
                </label>
                <input
                  type="date"
                  value={toDateInputValue(joinedTo)}
                  onChange={(e) => setJoinedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {config.showInactivityColumns && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Inactive for at least (days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minInactiveDays}
                    onChange={(e) => setMinInactiveDays(e.target.value)}
                    placeholder="e.g. 14"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {truncated && (
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl px-4 py-2.5">
            This list hit a safety cap and may not include every user — let me know if you need the full export.
          </p>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-[#1A1F26] border border-red-100 dark:border-red-500/20 rounded-3xl p-8 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1F26] rounded-3xl p-16 text-center border border-gray-200 dark:border-gray-800 border-dashed">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm || activeFilterCount > 0 ? 'No users match your search/filters' : 'No users found yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1A1F26] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                      {config.metricLabel}
                    </th>
                    {config.showInactivityColumns ? (
                      <>
                        <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                          Account Age
                        </th>
                        <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                          Inactive For
                        </th>
                      </>
                    ) : (
                      <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        {type === 'top-coins' ? 'Joined' : 'Last Visit'}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, i) => (
                    <tr
                      key={r.uid}
                      className="border-b border-gray-50 dark:border-gray-900 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-5 py-3 text-[11px] font-semibold text-gray-300 dark:text-gray-600">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 break-all">{r.email || '—'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">
                        {type === 'top-coins' ? formatCompact(r.coins || 0) : (r.visitCount || 0).toLocaleString()}
                      </td>
                      {config.showInactivityColumns ? (
                        <>
                          <td className="px-5 py-3 text-gray-400 dark:text-gray-500 hidden sm:table-cell">
                            {daysLabel(daysSince(r.createdAt))}
                          </td>
                          <td className="px-5 py-3 text-gray-400 dark:text-gray-500 hidden sm:table-cell">
                            {daysLabel(daysSince(r.lastVisitAt))}
                          </td>
                        </>
                      ) : (
                        <td className="px-5 py-3 text-gray-400 dark:text-gray-500 hidden sm:table-cell">
                          {type === 'top-coins' ? formatDate(r.createdAt) : formatDate(r.lastVisitAt)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
