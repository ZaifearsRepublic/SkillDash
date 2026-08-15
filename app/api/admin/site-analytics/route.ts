// app/api/admin/site-analytics/route.ts
// Admin-only read of the site-wide analytics rollups written by
// app/api/analytics/track/route.ts, plus registration and coin-leaderboard
// numbers pulled straight from the existing `users` collection (no new
// tracking needed for those — the data already exists).

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';
import {
  getDhakaDateKey,
  getLastNDhakaDateKeys,
  dhakaDateKeyToUtcMidnightISO,
  isoToDhakaDateKey,
} from '@/lib/utils/dhakaTime';
import { getAllUserBalances } from '@/lib/utils/simulatorBalances';
import { BD_GEO_BUCKETS } from '@/lib/utils/geoBucket';

// Ensure Firebase Admin is initialized with full credentials (side effect of import).
import '@/lib/coinManagerServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TREND_DAYS = 30;
// How far back an account must have been created before it's eligible to be
// flagged "least active" — a brand-new signup with zero visits isn't
// disengaged, they just haven't had a chance to come back yet.
const MIN_ACCOUNT_AGE_DAYS_FOR_INACTIVE_LIST = 3;
const TOP_PAGES_LIMIT = 8;
const TOP_STOCKS_LIMIT = 8;
// Safety cap on the trade_history collection-group scan — keeps this endpoint
// cheap even on a busy day. Ordered newest-first, so a truncation only ever
// drops the *older* end of the 30-day window, not today's activity.
const TRADE_FETCH_CAP = 3000;
// Broader page-view scan so blog/stock-page leaderboards can be sliced out of
// the same read instead of three separate top-N queries.
const PAGES_SCAN_LIMIT = 60;
// "Currently online" window — a session pinging within this window (and not
// yet ended) counts as live. Matches the ~25s heartbeat interval with room
// for one missed beat.
const ACTIVE_NOW_WINDOW_MS = 5 * 60 * 1000;
const RECHARGE_FETCH_CAP = 20_000;
// A single account this far above what normal recharge + trading activity
// could plausibly produce gets flagged for manual review. Well under
// app/api/simulator/trade's SANE_BALANCE_CAP (100M) — this is an early
// warning line, not the hard ceiling. See §6 of the balance-tampering
// incident this dashboard's watchlist exists because of.
const BALANCE_INTEGRITY_THRESHOLD = 10_000_000;
const BALANCE_INTEGRITY_WATCHLIST_LIMIT = 10;
// Capped scan for the retention cohort calculation — admin-only, on-demand,
// so a bounded full collection scan is acceptable (same pattern as
// getAllUserBalances / the user-list export route).
const RETENTION_USER_SCAN_CAP = 20_000;
const DAY_MS = 86400000;

const SOURCE_BUCKETS = ['direct', 'internal', 'search_google', 'search_other', 'social', 'other'] as const;

function toMillis(value: any): number {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'string') {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

function toIso(value: any): string | null {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function displayName(data: any): string {
  return data?.name || data?.displayName || (data?.email ? String(data.email).split('@')[0] : 'Unknown');
}

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ success: false, error: adminCheck.error }, { status: 401 });
    }

    const db = getFirestore();

    const todayKey = getDhakaDateKey(0);
    const trendKeys = getLastNDhakaDateKeys(TREND_DAYS); // oldest → newest, includes today
    const last7Keys = trendKeys.slice(-7);

    // ── Daily rollups (cheap: at most 30 single-doc reads) ──────────────
    const dailySnaps = await Promise.all(
      trendKeys.map((key) => db.collection('analytics_daily').doc(key).get())
    );
    const dailyByKey = new Map<string, any>();
    dailySnaps.forEach((snap, i) => {
      dailyByKey.set(trendKeys[i], snap.exists ? snap.data() : null);
    });

    const sumField = (keys: string[], field: string): number =>
      keys.reduce((sum, key) => sum + (dailyByKey.get(key)?.[field] || 0), 0);

    const visitorsToday = dailyByKey.get(todayKey)?.totalSessions || 0;
    const visitorsLast7 = sumField(last7Keys, 'totalSessions');
    const visitorsLast30 = sumField(trendKeys, 'totalSessions');

    const avgSeconds = (keys: string[]): number => {
      const totalSeconds = sumField(keys, 'totalActiveSeconds');
      const completed = sumField(keys, 'completedSessions');
      return completed > 0 ? Math.round(totalSeconds / completed) : 0;
    };

    const deviceBreakdown = {
      mobile: sumField(trendKeys, 'device_mobile'),
      tablet: sumField(trendKeys, 'device_tablet'),
      desktop: sumField(trendKeys, 'device_desktop'),
      unknown: sumField(trendKeys, 'device_unknown'),
    };

    // ── Location breakdown (last 30 days) — Vercel's IP-geolocation headers,
    // bucketed by app/api/analytics/track into a fixed set of BD divisional
    // cities plus other/outside/unknown catch-alls. See lib/utils/geoBucket.ts.
    const geoBreakdown = Object.fromEntries(
      BD_GEO_BUCKETS.map(({ key }) => [key, sumField(trendKeys, `geo_${key}`)])
    ) as Record<(typeof BD_GEO_BUCKETS)[number]['key'], number>;

    const dailyTrend = trendKeys.map((key) => {
      const d = dailyByKey.get(key);
      const sessions = d?.totalSessions || 0;
      const completed = d?.completedSessions || 0;
      const totalSeconds = d?.totalActiveSeconds || 0;
      return {
        dateKey: key,
        sessions,
        avgSeconds: completed > 0 ? Math.round(totalSeconds / completed) : 0,
      };
    });

    // ── Traffic sources (last 30 days) ───────────────────────────────────
    const trafficSources = Object.fromEntries(
      SOURCE_BUCKETS.map((bucket) => [bucket, sumField(trendKeys, `source_${bucket}`)])
    ) as Record<(typeof SOURCE_BUCKETS)[number], number>;

    // ── New vs returning visitor sessions (last 30 days) ─────────────────
    const newVsReturning = {
      new: sumField(trendKeys, 'newVisitorSessions'),
      returning: sumField(trendKeys, 'returningVisitorSessions'),
    };

    // ── Bounce rate (last 7 days — recent enough to be actionable) ───────
    const bounceSessions = sumField(last7Keys, 'bounces');
    const bounceEligibleSessions = sumField(last7Keys, 'completedSessions');
    const bounceRate = bounceEligibleSessions > 0 ? Math.round((bounceSessions / bounceEligibleSessions) * 100) : 0;

    // ── Peak activity hours, Dhaka local time (last 7 days) ──────────────
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: sumField(last7Keys, `hour_${hour}`),
    }));

    // ── Top pages (all-time running counter) — one broader scan, sliced
    // three ways so blog/stock-page popularity don't cost extra queries.
    const topPagesSnap = await db.collection('analytics_pages').orderBy('views', 'desc').limit(PAGES_SCAN_LIMIT).get();
    const allPages = topPagesSnap.docs.map((doc) => ({
      path: doc.data().path || doc.id,
      views: doc.data().views || 0,
    }));
    const topLandingPages = allPages.slice(0, TOP_PAGES_LIMIT);
    const topBlogPosts = allPages.filter((p) => p.path.startsWith('/blog/') && p.path !== '/blog/').slice(0, TOP_PAGES_LIMIT);
    const topStockPages = allPages.filter((p) => p.path.startsWith('/stocks/') && p.path !== '/stocks/').slice(0, TOP_PAGES_LIMIT);

    // ── Registrations (existing users.createdAt field, no new tracking) ─
    const usersCol = db.collection('users');
    const [regToday, reg7, reg30, totalUsersCountSnap] = await Promise.all([
      usersCol.where('createdAt', '>=', dhakaDateKeyToUtcMidnightISO(todayKey)).count().get(),
      usersCol.where('createdAt', '>=', dhakaDateKeyToUtcMidnightISO(last7Keys[0])).count().get(),
      usersCol.where('createdAt', '>=', dhakaDateKeyToUtcMidnightISO(trendKeys[0])).count().get(),
      usersCol.count().get(),
    ]);
    const totalRegisteredUsers = totalUsersCountSnap.data().count;

    // ── Live right now — sessions that pinged within the last 5 minutes and
    // haven't ended, deduped by identity (uid, else the session itself for
    // guests) so two tabs from one visitor count once. Single-field range
    // query only (endedAt filtered in JS) so this never needs a new
    // composite index.
    const activeSinceCutoff = new Date(Date.now() - ACTIVE_NOW_WINDOW_MS);
    const activeSessionsSnap = await db
      .collection('analytics_sessions')
      .where('lastPingAt', '>=', activeSinceCutoff)
      .limit(2000)
      .get();
    const activeIdentities = new Set<string>();
    for (const doc of activeSessionsSnap.docs) {
      const data = doc.data();
      if (data.endedAt) continue;
      activeIdentities.add(data.uid || doc.id);
    }
    const activeRightNow = activeIdentities.size;

    // ── Coin leaderboard — the real trading balance, not users.coins ────
    // (see lib/utils/simulatorBalances.ts for why). Fetching every balance
    // here also lets total-circulation and the top-10 leaderboard share one
    // consistent snapshot instead of two separate reads that could disagree.
    const { balances: allBalances, truncated: balancesTruncated } = await getAllUserBalances(db);
    const totalCoinsInCirculation = allBalances.reduce((sum, b) => sum + b.balance, 0);
    const topBalances = [...allBalances].sort((a, b) => b.balance - a.balance).slice(0, 10);
    const topCoinUserDocs = await Promise.all(topBalances.map((b) => usersCol.doc(b.uid).get()));
    const topCoinHolders = topBalances.map((b, i) => {
      const snap = topCoinUserDocs[i];
      const data = snap.exists ? snap.data() : null;
      return {
        uid: b.uid,
        name: data ? displayName(data) : 'Unknown',
        email: data?.email || null,
        coins: b.balance,
      };
    });

    // ── Balance integrity watchlist — flags accounts sitting on a balance no
    // normal amount of recharging + trading would plausibly produce, the
    // same shape of problem that prompted app/api/simulator/trade's
    // SANE_BALANCE_CAP. This dashboard can't tell tampering from a
    // legitimately huge winning streak, so it surfaces candidates for a
    // human to check (e.g. via /admin/users/top-coin-holders) rather than
    // taking any action itself.
    const flaggedBalances = allBalances
      .filter((b) => b.balance >= BALANCE_INTEGRITY_THRESHOLD)
      .sort((a, b) => b.balance - a.balance);
    const flaggedTopSlice = flaggedBalances.slice(0, BALANCE_INTEGRITY_WATCHLIST_LIMIT);
    const flaggedUserDocs = await Promise.all(flaggedTopSlice.map((b) => usersCol.doc(b.uid).get()));
    const balanceIntegrity = {
      threshold: BALANCE_INTEGRITY_THRESHOLD,
      flaggedCount: flaggedBalances.length,
      watchlist: flaggedTopSlice.map((b, i) => {
        const snap = flaggedUserDocs[i];
        const data = snap.exists ? snap.data() : null;
        return {
          uid: b.uid,
          name: data ? displayName(data) : 'Unknown',
          email: data?.email || null,
          coins: b.balance,
        };
      }),
    };

    // ── Most active registered users (visitCount rollup) ────────────────
    const mostActiveSnap = await usersCol.orderBy('visitCount', 'desc').limit(10).get();
    const mostActiveUsers = mostActiveSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: displayName(data),
        email: data.email || null,
        visitCount: data.visitCount || 0,
        totalActiveSeconds: data.totalActiveSeconds || 0,
        lastVisitAt: toIso(data.lastVisitAt),
      };
    });

    // ── Least active registered users ────────────────────────────────────
    // orderBy('visitCount') would silently exclude any account that has
    // never had the field written (e.g. everyone who signed up before this
    // feature shipped, or hasn't visited since) — exactly the accounts a
    // "who's gone quiet" list most needs to surface. So instead: pull the
    // oldest-registered accounts (the accounts that have had the most time
    // to prove engagement) and rank *those* by visitCount/lastVisitAt in
    // JS, where a missing visitCount correctly sorts as "0 visits".
    const cutoffIso = dhakaDateKeyToUtcMidnightISO(getDhakaDateKey(MIN_ACCOUNT_AGE_DAYS_FOR_INACTIVE_LIST));
    const oldestAccountsSnap = await usersCol.orderBy('createdAt', 'asc').limit(150).get();
    const leastActiveUsers = oldestAccountsSnap.docs
      .map((doc) => ({ uid: doc.id, ...doc.data() } as any))
      .filter((u) => u.createdAt && u.createdAt <= cutoffIso)
      .sort((a, b) => {
        const visitDiff = (a.visitCount || 0) - (b.visitCount || 0);
        if (visitDiff !== 0) return visitDiff;
        return toMillis(a.lastVisitAt) - toMillis(b.lastVisitAt);
      })
      .slice(0, 10)
      .map((u) => ({
        uid: u.uid,
        name: displayName(u),
        email: u.email || null,
        visitCount: u.visitCount || 0,
        totalActiveSeconds: u.totalActiveSeconds || 0,
        lastVisitAt: toIso(u.lastVisitAt),
        createdAt: u.createdAt || null,
      }));

    // ── Retention (D1/D7/D30) ─────────────────────────────────────────────
    // Only `createdAt` and `lastVisitAt` exist per user (no daily visit
    // history), so retention is approximated as: of accounts old enough to
    // judge this horizon, what fraction have a *most recent* visit that
    // landed at least N days after signup. That's a slight undercount of
    // true "came back on day N" retention (it misses someone who returned on
    // day N but never again), but it's honest about what the data supports
    // and needs no new tracking.
    const retentionSnap = await usersCol.select('createdAt', 'lastVisitAt').limit(RETENTION_USER_SCAN_CAP).get();
    const retentionDocs = retentionSnap.docs;
    const nowMs = Date.now();
    const retentionFor = (days: number) => {
      let eligible = 0;
      let retained = 0;
      for (const doc of retentionDocs) {
        const data = doc.data();
        const createdMs = toMillis(data.createdAt);
        if (!createdMs || nowMs - createdMs < days * DAY_MS) continue;
        eligible += 1;
        const lastVisitMs = toMillis(data.lastVisitAt);
        if (lastVisitMs && lastVisitMs - createdMs >= days * DAY_MS) retained += 1;
      }
      return { eligible, retained, rate: eligible > 0 ? Math.round((retained / eligible) * 100) : 0 };
    };
    const retention = {
      d1: retentionFor(1),
      d7: retentionFor(7),
      d30: retentionFor(30),
      sampledUsers: retentionDocs.length,
      truncated: retentionSnap.size >= RETENTION_USER_SCAN_CAP,
    };

    // ── Revenue / recharge analytics — recharge_requests is written by the
    // client (app/coins/page.tsx) and approved/rejected by
    // app/api/admin/recharge/route.ts, which recomputes creditedCoins itself
    // rather than trusting the client value (see that route for why).
    const rechargeSnap = await db.collection('recharge_requests').limit(RECHARGE_FETCH_CAP).get();
    const recharge30CutoffIso = dhakaDateKeyToUtcMidnightISO(trendKeys[0]);
    let approvedAllTimeBdt = 0;
    let approvedAllTimeCoins = 0;
    let approvedAllTimeCount = 0;
    let approved30Bdt = 0;
    let approved30Count = 0;
    let pendingCount = 0;
    let pendingBdt = 0;
    let rejected30Count = 0;
    const rechargerUidsAllTime = new Set<string>();
    const rechargerUids30 = new Set<string>();

    for (const doc of rechargeSnap.docs) {
      const r = doc.data();
      const amount = typeof r.amount === 'number' ? r.amount : 0;
      const coins = typeof r.creditedCoins === 'number' ? r.creditedCoins : typeof r.coins === 'number' ? r.coins : 0;

      if (r.status === 'approved') {
        approvedAllTimeBdt += amount;
        approvedAllTimeCoins += coins;
        approvedAllTimeCount += 1;
        if (r.userId) rechargerUidsAllTime.add(r.userId);
        const processedIso = toIso(r.processedAt);
        if (processedIso && processedIso >= recharge30CutoffIso) {
          approved30Bdt += amount;
          approved30Count += 1;
          if (r.userId) rechargerUids30.add(r.userId);
        }
      } else if (r.status === 'pending') {
        pendingCount += 1;
        pendingBdt += amount;
      } else if (r.status === 'rejected') {
        const processedIso = toIso(r.processedAt);
        if (processedIso && processedIso >= recharge30CutoffIso) rejected30Count += 1;
      }
    }

    const revenue = {
      approvedAllTime: { bdt: approvedAllTimeBdt, coins: approvedAllTimeCoins, count: approvedAllTimeCount },
      approvedLast30Days: { bdt: approved30Bdt, count: approved30Count },
      avgApprovedRechargeBdt: approvedAllTimeCount > 0 ? Math.round(approvedAllTimeBdt / approvedAllTimeCount) : 0,
      pending: { count: pendingCount, bdt: pendingBdt },
      rejectedLast30Days: rejected30Count,
      rechargerCount: rechargerUidsAllTime.size,
      conversionRatePercent:
        totalRegisteredUsers > 0 ? Math.round((rechargerUidsAllTime.size / totalRegisteredUsers) * 100) : 0,
      truncated: rechargeSnap.size >= RECHARGE_FETCH_CAP,
    };

    // ── Trading activity — reads the SAME trade_history data the simulator ─
    // already writes (hooks/useSimulator.ts); no new tracking needed, just a
    // collectionGroup query across every user's trade_history subcollection.
    // This needs a one-time Firestore index (collection group scope on
    // `timestamp`) — the first run may fail until that's created, so this
    // degrades gracefully rather than breaking the whole dashboard.
    let trading: any = null;
    let tradingError: string | null = null;
    try {
      const tradeCutoffIso = dhakaDateKeyToUtcMidnightISO(trendKeys[0]);
      const tradesSnap = await db
        .collectionGroup('trade_history')
        .where('timestamp', '>=', tradeCutoffIso)
        .orderBy('timestamp', 'desc')
        .limit(TRADE_FETCH_CAP)
        .get();

      const todayTraders = new Set<string>();
      const last7Traders = new Set<string>();
      const last30Traders = new Set<string>();
      let tradesToday = 0;
      let trades7 = 0;
      let trades30 = 0;
      let buys = 0;
      let sells = 0;
      const symbolCounts = new Map<string, number>();

      for (const doc of tradesSnap.docs) {
        const data = doc.data();
        if (typeof data.timestamp !== 'string') continue;

        const tradeDateKey = isoToDhakaDateKey(data.timestamp);
        const stateDocRef = doc.ref.parent.parent;
        const simulatorCollRef = stateDocRef?.parent;
        const uidDocRef = simulatorCollRef?.parent;
        const uid = uidDocRef?.id || null;

        trades30++;
        if (uid) last30Traders.add(uid);
        if (tradeDateKey >= last7Keys[0]) {
          trades7++;
          if (uid) last7Traders.add(uid);
        }
        if (tradeDateKey === todayKey) {
          tradesToday++;
          if (uid) todayTraders.add(uid);
        }

        if (data.type === 'BUY') buys++;
        else if (data.type === 'SELL') sells++;

        if (typeof data.symbol === 'string' && data.symbol) {
          symbolCounts.set(data.symbol, (symbolCounts.get(data.symbol) || 0) + 1);
        }
      }

      const mostTradedStocks = Array.from(symbolCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_STOCKS_LIMIT)
        .map(([symbol, count]) => ({ symbol, count }));

      trading = {
        trades: { today: tradesToday, last7Days: trades7, last30Days: trades30 },
        activeTraders: { today: todayTraders.size, last7Days: last7Traders.size, last30Days: last30Traders.size },
        buyVsSell: { buys, sells },
        mostTradedStocks,
        truncated: tradesSnap.size >= TRADE_FETCH_CAP,
      };
    } catch (err: any) {
      console.error('❌ Trading analytics unavailable:', err);
      tradingError =
        err?.code === 9 || /index/i.test(err?.message || '')
          ? 'Trading analytics need a one-time Firestore index for trade_history. Check the server/Vercel function logs for a "create index" link from this error, click it once, then refresh this page in a few minutes.'
          : 'Trading analytics unavailable right now.';
    }

    // ── Growth funnel (30d) — how far a visitor typically gets: browsing →
    // registering → placing a trade → putting real money behind it.
    const growthFunnel = [
      { stage: 'Visitors', value: visitorsLast30 },
      { stage: 'Registrations', value: reg30.data().count },
      { stage: 'Active traders', value: trading?.activeTraders.last30Days ?? 0 },
      { stage: 'Rechargers', value: rechargerUids30.size },
    ];

    return NextResponse.json(
      {
        success: true,
        activeRightNow,
        visitors: { today: visitorsToday, last7Days: visitorsLast7, last30Days: visitorsLast30 },
        avgSessionSeconds: { today: avgSeconds([todayKey]), last7Days: avgSeconds(last7Keys) },
        registrations: {
          today: regToday.data().count,
          last7Days: reg7.data().count,
          last30Days: reg30.data().count,
          totalAllTime: totalRegisteredUsers,
        },
        deviceBreakdown,
        geoBreakdown,
        dailyTrend,
        trafficSources,
        newVsReturning,
        bounceRate,
        retention,
        peakHours,
        topLandingPages,
        topBlogPosts,
        topStockPages,
        topCoinHolders,
        totalCoinsInCirculation,
        coinBalancesTruncated: balancesTruncated,
        balanceIntegrity,
        revenue,
        growthFunnel,
        mostActiveUsers,
        leastActiveUsers,
        trading,
        tradingError,
        methodologyNote:
          'Visit tracking started when this dashboard shipped — there is no historical data from before that. "Least active" is ranked among the oldest-registered accounts. Retention approximates "returned N+ days after signup" from last-visit data, not a full daily visit history.' +
          (balancesTruncated ? ' Coin circulation was computed from a capped sample of balances and may undercount.' : ''),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Site analytics API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load site analytics' },
      { status: 500 }
    );
  }
}
