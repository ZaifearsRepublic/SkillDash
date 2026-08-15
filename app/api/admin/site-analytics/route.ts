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

    // ── Top landing pages (all-time running counter) ─────────────────────
    const topPagesSnap = await db.collection('analytics_pages').orderBy('views', 'desc').limit(TOP_PAGES_LIMIT).get();
    const topLandingPages = topPagesSnap.docs.map((doc) => ({
      path: doc.data().path || doc.id,
      views: doc.data().views || 0,
    }));

    // ── Registrations (existing users.createdAt field, no new tracking) ─
    const usersCol = db.collection('users');
    const [regToday, reg7, reg30] = await Promise.all([
      usersCol.where('createdAt', '>=', dhakaDateKeyToUtcMidnightISO(todayKey)).count().get(),
      usersCol.where('createdAt', '>=', dhakaDateKeyToUtcMidnightISO(last7Keys[0])).count().get(),
      usersCol.where('createdAt', '>=', dhakaDateKeyToUtcMidnightISO(trendKeys[0])).count().get(),
    ]);

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

    return NextResponse.json(
      {
        success: true,
        visitors: { today: visitorsToday, last7Days: visitorsLast7, last30Days: visitorsLast30 },
        avgSessionSeconds: { today: avgSeconds([todayKey]), last7Days: avgSeconds(last7Keys) },
        registrations: {
          today: regToday.data().count,
          last7Days: reg7.data().count,
          last30Days: reg30.data().count,
        },
        deviceBreakdown,
        dailyTrend,
        trafficSources,
        newVsReturning,
        bounceRate,
        peakHours,
        topLandingPages,
        topCoinHolders,
        totalCoinsInCirculation,
        coinBalancesTruncated: balancesTruncated,
        mostActiveUsers,
        leastActiveUsers,
        trading,
        tradingError,
        methodologyNote:
          'Visit tracking started when this dashboard shipped — there is no historical data from before that. "Least active" is ranked among the oldest-registered accounts.' +
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
