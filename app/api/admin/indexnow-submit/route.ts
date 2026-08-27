// app/api/admin/indexnow-submit/route.ts
// Admin-triggered IndexNow submission. With no body, submits every URL
// currently in the sitemap — the one-time "seed IndexNow" action after
// setting the protocol up, or a manual re-push after a batch of content
// changes the automatic per-post webhook (app/api/contentful/revalidate)
// doesn't cover. With { urls: string[] } in the body, submits exactly that
// list instead.

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';
import { submitToIndexNow } from '@/lib/indexNow';
import sitemap from '@/app/sitemap';

// Ensure Firebase Admin is initialized with full credentials
import '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminAccess(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  let urls: string[];

  try {
    const body = await req.json().catch(() => null);
    const provided = body && Array.isArray(body.urls) ? body.urls : null;

    if (provided) {
      if (!provided.every((u: unknown) => typeof u === 'string')) {
        return NextResponse.json({ error: 'urls must be an array of strings' }, { status: 400 });
      }
      urls = provided;
    } else {
      const entries = await sitemap();
      urls = entries.map((entry) => entry.url);
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to build URL list' },
      { status: 500 }
    );
  }

  const result = await submitToIndexNow(urls);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
