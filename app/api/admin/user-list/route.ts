// app/api/admin/user-list/route.ts
// Admin-only export of the FULL (not just top-10) user rankings previewed on
// /admin — Most Active, Going Quiet, Top Coin Holders — so an admin can
// browse and download a CSV of every user in a list, not only the dashboard
// widget's top 10.

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';
import { dhakaDateKeyToUtcMidnightISO, getDhakaDateKey } from '@/lib/utils/dhakaTime';
import { getAllUserBalances } from '@/lib/utils/simulatorBalances';

// Ensure Firebase Admin is initialized with full credentials
import '@/lib/coinManagerServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TYPES = new Set(['most-active', 'going-quiet', 'top-coins']);
// Safety cap on the users collection scan — generous enough to return
// everyone at the site's current scale; surfaced via `truncated` rather than
// silently dropped if the site ever grows past it.
const USER_FETCH_CAP = 50_000;
// Same "give new signups a chance before calling them inactive" window used
// on the /admin dashboard preview.
const MIN_ACCOUNT_AGE_DAYS_FOR_INACTIVE = 3;

function toIso(value: any): string | null {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function toMillis(value: any): number {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'string') {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
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

    const type = req.nextUrl.searchParams.get('type');
    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing type. Must be one of: most-active, going-quiet, top-coins' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const usersSnap = await db.collection('users').limit(USER_FETCH_CAP).get();
    const usersTruncated = usersSnap.size >= USER_FETCH_CAP;
    const users = usersSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as any));

    let rows: any[] = [];
    let truncated = usersTruncated;

    if (type === 'most-active') {
      rows = users
        .map((u) => ({
          uid: u.uid,
          name: displayName(u),
          email: u.email || null,
          visitCount: u.visitCount || 0,
          totalActiveSeconds: u.totalActiveSeconds || 0,
          lastVisitAt: toIso(u.lastVisitAt),
          createdAt: u.createdAt || null,
        }))
        .sort((a, b) => b.visitCount - a.visitCount);
    } else if (type === 'going-quiet') {
      // Same reasoning as the dashboard preview: only accounts old enough to
      // have had a fair chance to come back are eligible, and a missing
      // visitCount correctly sorts to the bottom (0 visits) rather than
      // being excluded the way an orderBy('visitCount') query would.
      const cutoffIso = dhakaDateKeyToUtcMidnightISO(getDhakaDateKey(MIN_ACCOUNT_AGE_DAYS_FOR_INACTIVE));
      rows = users
        .filter((u) => u.createdAt && u.createdAt <= cutoffIso)
        .map((u) => ({
          uid: u.uid,
          name: displayName(u),
          email: u.email || null,
          visitCount: u.visitCount || 0,
          totalActiveSeconds: u.totalActiveSeconds || 0,
          lastVisitAt: toIso(u.lastVisitAt),
          createdAt: u.createdAt || null,
        }))
        .sort((a, b) => {
          const visitDiff = a.visitCount - b.visitCount;
          if (visitDiff !== 0) return visitDiff;
          return toMillis(a.lastVisitAt) - toMillis(b.lastVisitAt);
        });
    } else {
      // top-coins — the real trading balance (see lib/utils/simulatorBalances.ts),
      // joined against the already-fetched users collection for name/email.
      const { balances, truncated: balancesTruncated } = await getAllUserBalances(db);
      truncated = truncated || balancesTruncated;
      const userByUid = new Map(users.map((u) => [u.uid, u]));
      rows = balances
        .map((b) => {
          const u = userByUid.get(b.uid);
          return {
            uid: b.uid,
            name: u ? displayName(u) : 'Unknown',
            email: u?.email || null,
            coins: b.balance,
            createdAt: u?.createdAt || null,
          };
        })
        .sort((a, b) => b.coins - a.coins);
    }

    return NextResponse.json(
      {
        success: true,
        type,
        rows,
        count: rows.length,
        truncated,
      },
      { headers: { 'Cache-Control': 'private, max-age=30' } }
    );
  } catch (error: any) {
    console.error('❌ Admin user-list API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load user list' },
      { status: 500 }
    );
  }
}
