// app/api/disclaimer/agree/route.ts
// Records a user's agreement to the educational-use-only disclaimer (see
// components/app/DisclaimerGate.tsx). This is the ONLY thing allowed to set
// users/{uid}.disclaimerAgreedAt — firestore.rules excludes that field from
// client writes the same way it excludes coins/admin/role, so the consent
// timestamp can't be spoofed or backdated client-side.
//
// Idempotent: calling this after agreement is already recorded just returns
// the existing timestamp rather than overwriting it or double-counting the
// daily analytics tally below.

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getDhakaDateKey } from '@/lib/utils/dhakaTime';

// Ensure Firebase Admin is initialized with full credentials
import '@/lib/coinManagerServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);
    const dailyRef = db.collection('analytics_daily').doc(getDhakaDateKey(0));

    const agreedAt = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const existing = userSnap.data()?.disclaimerAgreedAt;
      if (typeof existing === 'string' && existing) {
        return existing;
      }

      const nowIso = new Date().toISOString();
      transaction.set(userRef, { disclaimerAgreedAt: nowIso }, { merge: true });
      transaction.set(dailyRef, { disclaimerAgreedCount: FieldValue.increment(1) }, { merge: true });
      return nowIso;
    });

    return NextResponse.json({ success: true, disclaimerAgreedAt: agreedAt });
  } catch (err: any) {
    console.error('[disclaimer/agree] Failed:', err.message);
    return NextResponse.json({ success: false, error: 'Failed to record agreement' }, { status: 500 });
  }
}
