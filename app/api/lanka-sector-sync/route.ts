import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// app/api/lanka-sector-sync/route.ts
// Writes artifacts/{appId}/public/data/market_info/sectors from
// api/lanka_sector_sync.py's scrape of lankabd.com's DataMatrix board.
// This is Scraper A from the DSE-market-data-pipeline plan: a slow-moving
// reference sync (industry sector), meant to run roughly every two weeks —
// not a price feed, so it doesn't belong on the 3-minute stock-sync cadence.
//
// "Only write on change" (per the plan): every run updates a cheap
// `lastChecked` timestamp so a healthy-but-unchanged run is still visible,
// but the `sectors` map, `lastChanged`, and a changelog entry are only
// written when the scrape actually differs from what's stored — which
// doubles as a free audit trail of real DSE sector reclassifications
// (artifacts/{appId}/public/data/market_info/sectors/changelog/{id}).
//
// Mirrors app/api/category-sync/route.ts's auth pattern, Admin SDK init,
// and its two-layer defense against a bad scrape overwriting good data:
// a fixed floor (MIN_TOTAL_SYMBOLS) and a day-over-day drop-fraction guard
// (MAX_DROP_FRACTION) — real sector moves are a slow trickle, never a mass
// same-day shift.

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  return initializeApp({
    credential: admin.credential.cert({
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
    } as admin.ServiceAccount),
  });
}

function buildSyncUrl(): string {
  if (process.env.LANKA_SECTOR_SYNC_URL) return process.env.LANKA_SECTOR_SYNC_URL;
  // Production: Vercel routes /api/lanka_sector_sync to the Python function.
  const base = `https://${process.env.VERCEL_URL}`;
  return `${base}/api/lanka_sector_sync`;
}

// Matches api/lanka_sector_sync.py's own MIN_TOTAL_SYMBOLS — kept here too
// as a redundant guard, same as category-sync's route re-checking
// MIN_CATEGORIZED even though the Python side already checks it.
const MIN_TOTAL_SYMBOLS = 100;

// A day-over-day drop bigger than this fraction is treated as a scrape
// problem, not real sector reassignment activity.
const MAX_DROP_FRACTION = 0.15;

interface SectorDiff {
  added: { symbol: string; to: string }[];
  removed: { symbol: string; from: string }[];
  changed: { symbol: string; from: string; to: string }[];
}

function diffSectors(previous: Record<string, string>, next: Record<string, string>): SectorDiff {
  const diff: SectorDiff = { added: [], removed: [], changed: [] };

  for (const [symbol, sector] of Object.entries(next)) {
    const prevSector = previous[symbol];
    if (prevSector === undefined) diff.added.push({ symbol, to: sector });
    else if (prevSector !== sector) diff.changed.push({ symbol, from: prevSector, to: sector });
  }
  for (const [symbol, sector] of Object.entries(previous)) {
    if (next[symbol] === undefined) diff.removed.push({ symbol, from: sector });
  }

  return diff;
}

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error('[lanka-sector-sync] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  const isAuthed = authHeader === `Bearer ${expectedSecret}` || apiKey === expectedSecret;

  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Scrape ────────────────────────────────────────────────────────────────
  const scrapeUrl = buildSyncUrl();
  console.log(`[lanka-sector-sync] Fetching: ${scrapeUrl}`);

  let sectors: Record<string, string>;

  try {
    const pythonRes = await fetch(scrapeUrl, {
      headers: { 'User-Agent': 'StockSimulatorBD-LankaSectorSync/1.0' },
    });

    if (!pythonRes.ok) {
      const body = await pythonRes.text();
      throw new Error(`Python scraper HTTP ${pythonRes.status}: ${body.slice(0, 300)}`);
    }

    const contentType = pythonRes.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const body = await pythonRes.text();
      throw new Error(
        `Python scraper returned non-JSON (${contentType}). Route misconfigured? Body: ${body.slice(0, 300)}`
      );
    }

    const payload = await pythonRes.json();
    sectors = payload.sectors;
  } catch (err: any) {
    console.error('[lanka-sector-sync] Scrape failed:', err.message);
    return NextResponse.json({ error: `Scrape failed: ${err.message}` }, { status: 502 });
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const symbolCount = sectors ? Object.keys(sectors).length : 0;
  if (!sectors || symbolCount < MIN_TOTAL_SYMBOLS) {
    const msg = `Scraper returned ${symbolCount} symbols (need >= ${MIN_TOTAL_SYMBOLS}) — aborting write`;
    console.error(`[lanka-sector-sync] ${msg}`);
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  // ── Diff, sanity-check, and (conditionally) write ────────────────────────
  try {
    const db = getFirestore(getAdminApp());
    const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID;

    if (!appId) {
      throw new Error('NEXT_PUBLIC_SIMULATOR_APP_ID env var is not set');
    }

    const sectorsRef = db
      .collection('artifacts')
      .doc(appId)
      .collection('public')
      .doc('data')
      .collection('market_info')
      .doc('sectors');

    const existingSnap = await sectorsRef.get();
    const previousData = existingSnap.exists ? existingSnap.data() : undefined;
    const previousSectors: Record<string, string> = previousData?.sectors || {};
    const previousTotal: number | undefined = previousData?.totalSectors;

    // Adaptive fail-safe, same shape as category-sync's: only engages once
    // there's a prior sync large enough to trust as a baseline.
    if (typeof previousTotal === 'number' && previousTotal >= MIN_TOTAL_SYMBOLS) {
      const dropFraction = (previousTotal - symbolCount) / previousTotal;
      if (dropFraction > MAX_DROP_FRACTION) {
        const msg =
          `New sync (${symbolCount} symbols) is ${(dropFraction * 100).toFixed(0)}% below the previous ` +
          `known-good sync (${previousTotal} symbols) — that's a bigger single-run move than real sector ` +
          `reclassification produces. Aborting write; previous data is untouched.`;
        console.error(`[lanka-sector-sync] ${msg}`);
        return NextResponse.json({ error: msg, previousTotal, newTotal: symbolCount }, { status: 422 });
      }
    }

    const now = new Date().toISOString();
    const isFirstRun = !existingSnap.exists;
    const diff = isFirstRun ? null : diffSectors(previousSectors, sectors);
    const hasChanges = isFirstRun || !diff || diff.added.length + diff.removed.length + diff.changed.length > 0;

    if (!hasChanges) {
      // Nothing changed — record that the sync ran and stop. Avoids
      // rewriting an identical map (and skipping a changelog entry) on
      // every one of these slow-cadence runs, most of which will see no
      // real-world sector movement at all.
      await sectorsRef.set({ lastChecked: now }, { merge: true });
      console.log(`[lanka-sector-sync] ✓ No changes (${symbolCount} symbols) — lastChecked updated`);
      return NextResponse.json({
        success: true,
        changed: false,
        message: `Checked ${symbolCount} symbols — no sector changes since last sync.`,
        appId,
        timestamp: now,
      });
    }

    await sectorsRef.set({
      sectors,
      totalSectors: symbolCount,
      lastChecked: now,
      lastChanged: now,
    });

    if (diff && (diff.added.length || diff.removed.length || diff.changed.length)) {
      await sectorsRef.collection('changelog').add({
        timestamp: now,
        previousTotal: previousTotal ?? null,
        newTotal: symbolCount,
        added: diff.added,
        removed: diff.removed,
        changed: diff.changed,
      });
    }

    console.log(
      `[lanka-sector-sync] ✓ Wrote ${symbolCount} sectors to ${appId}` +
        (diff ? ` (+${diff.added.length} -${diff.removed.length} ~${diff.changed.length})` : ' (initial sync)')
    );

    return NextResponse.json({
      success: true,
      changed: true,
      message: `Successfully synced ${symbolCount} stock sectors.`,
      diff: diff
        ? { added: diff.added.length, removed: diff.removed.length, changed: diff.changed.length }
        : 'initial',
      appId,
      timestamp: now,
    });
  } catch (err: any) {
    console.error('[lanka-sector-sync] Firestore write failed:', err.message);
    return NextResponse.json({ error: `DB write failed: ${err.message}` }, { status: 500 });
  }
}
