// app/api/survey/trade-questionnaire/route.ts
// Handles the mandatory once-per-account /trade questionnaire submissions (POST)
// and administrative dashboard retrieval (GET).
//
// POST is authenticated via Firebase ID token and records the submission in
// `survey_responses/{uid}` while marking `users/{uid}.tradeSurveyCompletedAt`.
// GET is gated to admins via `verifyAdminAccess`.

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';

// Ensure Firebase Admin is initialized
import '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { VALID_DOMAIN_CHOICES, DomainChoiceId } from '@/lib/surveyConstants';

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

    const body = await req.json().catch(() => ({}));
    const { tradingExperience, domainChoice } = body;

    const rating = Number(tradingExperience);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      return NextResponse.json(
        { success: false, error: 'Trading experience must be an integer between 1 and 10' },
        { status: 400 }
      );
    }

    const matchedOption = VALID_DOMAIN_CHOICES.find((opt) => opt.id === domainChoice);
    if (!matchedOption) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain choice option' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const nowIso = new Date().toISOString();

    const responseRef = db.doc(`survey_responses/${uid}`);
    const userRef = db.doc(`users/${uid}`);

    // Save response keyed by uid to prevent duplicate submissions per account
    await responseRef.set(
      {
        uid,
        userEmail: decodedToken.email || null,
        displayName: decodedToken.name || null,
        tradingExperience: rating,
        domainChoice: matchedOption.id,
        domainChoiceLabelEn: matchedOption.labelEn,
        domainChoiceLabelBn: matchedOption.labelBn,
        submittedAt: FieldValue.serverTimestamp(),
        submittedAtIso: nowIso,
      },
      { merge: true }
    );

    // Flag the user profile so the modal never shows again for this account
    await userRef.set(
      {
        tradeSurveyCompletedAt: nowIso,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Survey response recorded successfully',
      submittedAt: nowIso,
    });
  } catch (error: any) {
    console.error('Error recording survey response:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit response' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await verifyAdminAccess(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ success: false, error: adminCheck.error || 'Unauthorized' }, { status: 403 });
    }

    const db = getFirestore();
    const snapshot = await db.collection('survey_responses').get();

    const responses: any[] = [];
    let ratingSum = 0;
    const choiceCounts: Record<string, number> = {
      shahoriar_bd: 0,
      beg_crowdfund: 0,
      vercel_app: 0,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      const rating = Number(data.tradingExperience) || 0;
      ratingSum += rating;

      if (data.domainChoice && choiceCounts[data.domainChoice] !== undefined) {
        choiceCounts[data.domainChoice] += 1;
      }

      responses.push({
        id: doc.id,
        uid: data.uid,
        userEmail: data.userEmail || 'Anonymous',
        displayName: data.displayName || null,
        tradingExperience: rating,
        domainChoice: data.domainChoice,
        domainChoiceLabelEn: data.domainChoiceLabelEn || '',
        domainChoiceLabelBn: data.domainChoiceLabelBn || '',
        submittedAtIso: data.submittedAtIso || (data.submittedAt?.toDate ? data.submittedAt.toDate().toISOString() : null),
      });
    });

    // Sort responses by submittedAt descending (in JS to avoid missing field omissions)
    responses.sort((a, b) => {
      const timeA = a.submittedAtIso ? new Date(a.submittedAtIso).getTime() : 0;
      const timeB = b.submittedAtIso ? new Date(b.submittedAtIso).getTime() : 0;
      return timeB - timeA;
    });

    const total = responses.length;
    const averageExperience = total > 0 ? Number((ratingSum / total).toFixed(1)) : 0;

    const choiceStats = Object.keys(choiceCounts).map((key) => {
      const count = choiceCounts[key];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      const optionInfo = VALID_DOMAIN_CHOICES.find((opt) => opt.id === key);
      return {
        id: key,
        labelEn: optionInfo?.labelEn || key,
        labelBn: optionInfo?.labelBn || key,
        count,
        percentage,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalResponses: total,
        averageExperience,
        choiceStats,
      },
      responses,
    });
  } catch (error: any) {
    console.error('Error fetching survey responses:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
