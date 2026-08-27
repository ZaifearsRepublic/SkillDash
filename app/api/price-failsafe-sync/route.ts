import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { isMarketOpenServer } from '@/lib/utils/marketHours';
import { sendAdminAlertEmail } from '@/lib/resendAdmin';

// app/api/price-failsafe-sync/route.ts
// Scraper B of the DSE-market-data-pipeline plan. Unlike stock-sync/
// category-sync/lanka-sector-sync, this route does NOT unconditionally
// scrape-and-write on every invocation — it's meant to be hit on the same
// kind of frequent cron cadence as stock-sync, but only *acts* when the
// primary scraper's heartbeat (market_info/latest.lastUpdated) has gone
// stale during market hours. api/market_sync.py "never broke" so far, but
// that's not something to trust indefinitely — this is the backstop for the
// day it does, sourcing prices from lankabd.com (api/lanka_price_sync.py)
// instead of dsebd.org, and emailing the admin via Resend (lib/resendAdmin)
// so a silent outage doesn't just sit there un-noticed.
//
// State lives in two docs under the same market_info collection stock-sync
// already writes to:
//   market_info/latest         — same doc stock-sync writes; only touched
//                                 here when actually activating the failsafe,
//                                 and always with source: 'lankabd-failsafe'
//                                 so it's obvious which source is live. The
//                                 next successful stock-sync .set() (full
//                                 replace, no merge) wipes these fields
//                                 automatically on recovery — no extra
//                                 recovery-write code needed for that doc.
//   market_info/failsafeStatus — { active, activatedAt, primaryLastUpdated,
//                                 lastAlertSentAt, lastCheckedAt }. Tracks
//                                 whether we're currently in a failsafe
//                                 episode and when the admin was last
//                                 emailed about it, purely for this route's
//                                 own bookkeeping (cooldown + recovery
//                                 detection).

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
  if (process.env.LANKA_PRICE_SYNC_URL) return process.env.LANKA_PRICE_SYNC_URL;
  const base = `https://${process.env.VERCEL_URL}`;
  return `${base}/api/lanka_price_sync`;
}

// Primary sync runs roughly every 3 minutes (see CLAUDE.md). 15 minutes is
// 5 missed cycles — generous enough that one slow/transient run never
// triggers this, but not so loose that a real outage runs unnoticed for long.
const STALE_THRESHOLD_MS = 15 * 60 * 1000;

// While an outage is ongoing, re-notify at most this often rather than on
// every cron tick (which could be every few minutes).
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;

// Redundant floor matching api/lanka_price_sync.py's own MIN_TOTAL_SYMBOLS,
// same "check it here too" pattern as the other *-sync routes.
const MIN_TOTAL_SYMBOLS = 200;

interface FailsafeStatus {
  active?: boolean;
  activatedAt?: string;
  primaryLastUpdated?: string | null;
  lastAlertSentAt?: string;
  lastCheckedAt?: string;
}

function adminPanelLink(): string {
  const domain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://www.stocksimulator.tech';
  return `${domain.replace(/\/+$/, '')}/admin`;
}

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.error('[price-failsafe-sync] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  const isAuthed = authHeader === `Bearer ${expectedSecret}` || apiKey === expectedSecret;
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_SIMULATOR_APP_ID env var is not set' }, { status: 500 });
  }

  const db = getFirestore(getAdminApp());
  const marketInfoCol = db
    .collection('artifacts')
    .doc(appId)
    .collection('public')
    .doc('data')
    .collection('market_info');
  const latestRef = marketInfoCol.doc('latest');
  const statusRef = marketInfoCol.doc('failsafeStatus');

  const now = new Date();
  const nowIso = now.toISOString();

  const [latestSnap, statusSnap] = await Promise.all([latestRef.get(), statusRef.get()]);
  const latestData = latestSnap.exists ? latestSnap.data() : undefined;
  const status: FailsafeStatus = statusSnap.exists ? (statusSnap.data() as FailsafeStatus) : {};

  const primaryLastUpdated: string | null =
    typeof latestData?.lastUpdated === 'string' ? latestData.lastUpdated : null;
  const ageMs = primaryLastUpdated ? now.getTime() - new Date(primaryLastUpdated).getTime() : Infinity;
  const isStale = !(ageMs <= STALE_THRESHOLD_MS);

  const marketOpen = isMarketOpenServer(now);

  // Outside trading hours, staleness doesn't mean anything — the primary may
  // legitimately not be writing at all. Leave any existing failsafe state
  // untouched; the next in-hours tick resolves it either way.
  if (!marketOpen) {
    return NextResponse.json({
      success: true,
      action: 'skipped-market-closed',
      isStale,
      marketOpen: false,
    });
  }

  // ── Primary healthy ──────────────────────────────────────────────────────
  if (!isStale) {
    if (status.active) {
      const recoveryHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">✅ DSE price scraper recovered</h1>
          </div>
          <div style="background: #f7fafc; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="color: #1a202c;">api/market_sync.py is writing fresh data again as of ${nowIso}.</p>
            <p style="color: #1a202c;">The lankabd.com failsafe (Scraper B) has been deactivated. It had been active since ${status.activatedAt ?? 'an earlier check'}.</p>
          </div>
          <div style="background: white; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
            <a href="${adminPanelLink()}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Admin Panel</a>
          </div>
        </div>
      `;
      const emailResult = await sendAdminAlertEmail({
        subject: '✅ DSE price scraper recovered — failsafe deactivated',
        html: recoveryHtml,
      });
      if (!emailResult.success) {
        console.error('[price-failsafe-sync] Recovery email failed:', emailResult.error);
      }

      await statusRef.set({ active: false, recoveredAt: nowIso, lastCheckedAt: nowIso }, { merge: true });

      return NextResponse.json({ success: true, action: 'recovered', alertSent: emailResult.success });
    }

    return NextResponse.json({ success: true, action: 'healthy-noop', isStale: false });
  }

  // ── Primary stale during market hours — activate the failsafe ───────────
  console.warn(
    `[price-failsafe-sync] Primary stale (age ${Math.round(ageMs / 60000)}m, lastUpdated=${primaryLastUpdated ?? 'never'}) — trying lankabd.com failsafe`
  );

  const shouldAlert =
    !status.lastAlertSentAt || now.getTime() - new Date(status.lastAlertSentAt).getTime() > ALERT_COOLDOWN_MS;

  let scrapedStocks: unknown[] | null = null;
  let scrapeError: string | null = null;

  try {
    const pythonRes = await fetch(buildSyncUrl(), {
      headers: { 'User-Agent': 'StockSimulatorBD-PriceFailsafeSync/1.0' },
    });

    if (!pythonRes.ok) {
      const body = await pythonRes.text();
      throw new Error(`lanka_price_sync HTTP ${pythonRes.status}: ${body.slice(0, 300)}`);
    }

    const contentType = pythonRes.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const body = await pythonRes.text();
      throw new Error(`lanka_price_sync returned non-JSON (${contentType}). Body: ${body.slice(0, 300)}`);
    }

    const payload = await pythonRes.json();
    const stocks = payload?.stocks;
    if (!Array.isArray(stocks) || stocks.length < MIN_TOTAL_SYMBOLS) {
      throw new Error(
        `lanka_price_sync returned ${Array.isArray(stocks) ? stocks.length : 'non-array'} stocks (need >= ${MIN_TOTAL_SYMBOLS})`
      );
    }
    scrapedStocks = stocks;
  } catch (err: any) {
    scrapeError = err.message || 'Unknown scrape error';
    console.error('[price-failsafe-sync] lankabd scrape failed:', scrapeError);
  }

  const baseStatus: FailsafeStatus = {
    active: true,
    activatedAt: status.activatedAt ?? nowIso,
    primaryLastUpdated,
    lastCheckedAt: nowIso,
    lastAlertSentAt: status.lastAlertSentAt,
  };

  // Both the primary AND the failsafe are down — the more urgent case. Leave
  // market_info/latest untouched (stale-but-real data beats no data).
  if (!scrapedStocks) {
    let alertSent = false;
    if (shouldAlert) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">🆘 DSE price scraper down — failsafe also failed</h1>
          </div>
          <div style="background: #f7fafc; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="color: #1a202c;">api/market_sync.py hasn't written fresh data since ${primaryLastUpdated ?? 'unknown'} (~${Math.round(ageMs / 60000)} minutes ago), and the lankabd.com failsafe scrape just failed too:</p>
            <p style="color: #991b1b; font-family: monospace; background: #fef2f2; padding: 10px; border-radius: 4px;">${scrapeError}</p>
            <p style="color: #1a202c;">Prices shown in the app are currently stale. This needs manual attention.</p>
          </div>
          <div style="background: white; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
            <a href="${adminPanelLink()}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Admin Panel</a>
          </div>
        </div>
      `;
      const emailResult = await sendAdminAlertEmail({
        subject: '🆘 DSE price scraper down AND lankabd failsafe failed',
        html,
      });
      alertSent = emailResult.success;
      if (emailResult.success) baseStatus.lastAlertSentAt = nowIso;
      else console.error('[price-failsafe-sync] Dual-failure email failed:', emailResult.error);
    }

    await statusRef.set(baseStatus, { merge: true });

    return NextResponse.json(
      { success: false, action: 'failsafe-scrape-failed', error: scrapeError, alertSent },
      { status: 502 }
    );
  }

  // Failsafe scrape succeeded — write it as the live market data.
  await latestRef.set({
    stocks: scrapedStocks,
    lastUpdated: nowIso,
    totalStocks: scrapedStocks.length,
    marketStatus: null, // lankabd doesn't publish DSE's own open/closed banner
    source: 'lankabd-failsafe',
    primaryLastUpdated,
  });

  let alertSent = false;
  if (shouldAlert) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ea580c; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🚨 DSE price scraper down — failsafe active</h1>
        </div>
        <div style="background: #f7fafc; padding: 20px; border: 1px solid #e2e8f0;">
          <p style="color: #1a202c;">api/market_sync.py hasn't written fresh data since ${primaryLastUpdated ?? 'unknown'} (~${Math.round(ageMs / 60000)} minutes ago).</p>
          <p style="color: #1a202c;">The app is now running on the lankabd.com backup source (Scraper B) — ${scrapedStocks.length} symbols synced as of ${nowIso}. Trading continues normally on this data, but the primary DSE scraper (dsebd.org) needs to be checked.</p>
          <p style="color: #718096; font-size: 12px;">You'll get another email if this is still ongoing in an hour, and a recovery email once the primary starts writing again.</p>
        </div>
        <div style="background: white; padding: 20px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
          <a href="${adminPanelLink()}" style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Admin Panel</a>
        </div>
      </div>
    `;
    const emailResult = await sendAdminAlertEmail({
      subject: `🚨 DSE price scraper down — lankabd failsafe active (${scrapedStocks.length} stocks)`,
      html,
    });
    alertSent = emailResult.success;
    if (emailResult.success) baseStatus.lastAlertSentAt = nowIso;
    else console.error('[price-failsafe-sync] Activation email failed:', emailResult.error);
  }

  await statusRef.set(baseStatus, { merge: true });

  console.log(`[price-failsafe-sync] ✓ Failsafe active — wrote ${scrapedStocks.length} stocks from lankabd.com`);

  return NextResponse.json({
    success: true,
    action: 'failsafe-activated',
    symbolCount: scrapedStocks.length,
    primaryLastUpdated,
    alertSent,
  });
}
