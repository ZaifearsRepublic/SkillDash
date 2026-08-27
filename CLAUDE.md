# CLAUDE.md

Project context for Claude (Claude Code / any LLM agent) working in this repo. Read this before making changes — it'll save you from re-discovering things the hard way.

## What this is

**StockSimulatorBD** (stocksimulator.tech) — a free, risk-free paper-trading simulator for the Dhaka Stock Exchange (DSE). Next.js 16 / React 19 / TypeScript, Firebase (Auth + Firestore + Admin SDK) backend, deployed on Vercel, `pnpm` package manager, Tailwind CSS 3.

Audience: students learning the market, and increasingly new investors moving from safer instruments (Sanchayapatra, fixed deposits) into stocks and feeling nervous about it. Keep both framings in mind when touching user-facing copy — don't drop one for the other.

Built and maintained solo by Md Al Shahoriar Hossain (`zaifears`). No test suite exists — verification is `tsc --noEmit` plus manual/browser checks, not automated tests.

## Repo layout

```
app/
  page.tsx                      Homepage
  trade/                        Main trading terminal (client-heavy, real-time)
  stocks/[symbol]/              Per-stock page: candlestick chart + trade panel
  blog/, blog/[slug]/           Contentful-backed articles
  coins/                        Balance + bKash recharge UI
  profile/                      User profile
  auth/                         Login/signup (email, Google, Google One Tap)
  admin/                        Admin dashboard (custom-claim gated)
    users/{most-active,going-quiet,top-coin-holders}/  full exportable user lists
    recharge/{pending,approved,rejected}/               recharge queue review
  policy/                       Privacy Policy + Terms + trading/virtual-currency disclaimers
  api/                          Next.js route handlers (see below)
api/                            Vercel PYTHON serverless functions (NOT under app/api) —
  dse_chart.py                  scrapes dsebd.org day-end archive for chart candles
  market_sync.py                live price sync (primary, dsebd.org)
  category_sync.py              DSE market-category (A/B/G/N/Z) sync — see note below
  lanka_sector_sync.py          industry sector sync (Scraper A, lankabd.com) — see note below
  lanka_price_sync.py           price failsafe (Scraper B, lankabd.com) — see note below
  run_market.py, run_chart.py   related sync entry points
components/
  admin/                        SiteAnalyticsSection.tsx, UserExportList.tsx, RechargeList.tsx
  simulator/trade/               TradeModal.tsx
  shared/                       Footer.tsx etc.
lib/
  firebaseAdmin.ts              Firebase Admin SDK init — side-effect import shared by every server route
  utils/                        money.ts, marketHours.ts, dhakaTime.ts, geoBucket.ts,
                                 persistentRateLimit.ts, simulatorBalances.ts, fetchWithToken.ts,
                                 adminVerification.ts
  contentful.ts, contentful-blog.ts   blog CMS client
  dseStocks.ts, dseCompanyNames.ts, bangladeshHolidays.ts
firestore.rules
```

## One currency

`artifacts/{appId}/users/{uid}/simulator/state.balance` is the only currency in the app — the real BDT-equivalent trading balance. `appId` = `process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1'`. Credited by bKash recharge approval (`app/api/admin/recharge/route.ts`) and the welcome bonus (`app/api/auth/grant-social-bonus/route.ts`), spent/earned by trading.

A separate legacy `users/{uid}.coins` gating currency (`lib/coinManagerServer.ts`, `lib/coinManager.ts`, `lib/coinBatching.ts`) used to exist for "premium"/AI-analysis-style features. It was never wired to any live feature — no AI-analysis feature exists, and its own signup/welcome-bonus grant path was superseded by `grant-social-bonus` crediting the balance above directly. Removed entirely (code, API routes, Firestore field, and the `firestore.rules` protection for it) as dead weight. Any analytics or admin "coins" feature reads `simulator/state.balance` — use `lib/utils/simulatorBalances.ts`'s `getAllUserBalances()`.

**Recharge pricing:** 20 BDT = 10,000 coins (500 coins per taka), minimum 20 BDT, maximum 5,000 BDT per request, amount must be a multiple of 20. The rate is duplicated in three places that must move together: `app/coins/page.tsx` (`PRICE_PER_10K_COINS`, client display/validation), `app/api/admin/recharge/route.ts` (`PRICE_PER_10K_COINS`/`coinsForAmount()`, the authoritative credit computed server-side from the request's `amount` field — never trusts the client-submitted `coins` field), and `firestore.rules`' `recharge_requests` create validation (`amount % 20 == 0`, `coins == (amount / 20) * 10000`).

## Trading is fully server-side

`hooks/useSimulator.ts`'s `executeTrade()` does **not** write Firestore directly — it POSTs to `app/api/simulator/trade/route.ts`, which is the only thing allowed to write `simulator/state`. That route:
- re-derives price from `artifacts/{appId}/public/data/market_info/latest` (never trusts a client-submitted price)
- recomputes commission (`lib/utils/money.ts`, `COMMISSION_RATE = 0.004`)
- enforces the T+1 rule **per purchase lot** (`portfolio[].lots[]`, not just an aggregate `purchaseDate` — a past bug let same-day-purchased shares slip through if merged into an existing older position)
- enforces market hours via `lib/utils/marketHours.ts`'s `isMarketOpenServer()` (mirrors the client check in `useSimulator.ts`, but sources holidays from the local `bangladeshHolidays.ts` dataset, not the `/api/holidays` route — a relative fetch URL doesn't resolve server-side)
- re-enforces `SANE_BALANCE_CAP` (100,000,000) on the SELL path by hand, because **Admin SDK writes bypass `firestore.rules` entirely** — any privileged write path has to reimplement its own limits, rules alone won't catch it

This exists because of a real incident: `firestore.rules` used to allow direct client writes to `simulator/state`, and several accounts got balances tampered up to 10^31 via devtools. `firestore.rules` now only allows the client to `create` the brand-new-user zero-balance doc; everything else is `update, delete: if false`.

## Admin API pattern

- Admin-gated route: `verifyAdminAccess(req)` from `lib/utils/adminVerification.ts` (Firebase custom claim `admin===true`, falls back to `users/{uid}.role==='admin'`). Also `import '@/lib/firebaseAdmin'` for its Admin-SDK-init side effect, plus `export const runtime='nodejs'; export const dynamic='force-dynamic';`.
- Non-admin authenticated route (e.g. the trade route, `grant-social-bonus`): manual Bearer-token extraction + `getAuth().verifyIdToken()` — no shared helper exists for this yet, both routes duplicate the ~10-line block.
- Client → server auth: `fetchWithToken` / `fetchWithFreshToken` (`lib/utils/fetchWithToken.ts`) auto-attach a fresh Firebase ID token and retry once on 401.

## Analytics (`app/api/analytics/track`, `components/admin/SiteAnalyticsSection.tsx`)

- `VisitTracker.tsx` (mounted in `app/layout.tsx`) beacons `start`/`heartbeat`/`end` to `/api/analytics/track`, which rolls up into `analytics_daily/{dateKey}` (device/source/hour/**geo**_* increment fields), `analytics_sessions/{sessionId}`, `analytics_pages/{pathId}`, and a lightweight `users/{uid}.visitCount`/`lastVisitAt`/`totalActiveSeconds`.
- **Rate limiting**: `lib/utils/persistentRateLimit.ts`'s `checkPersistentRateLimit(identifier, options?)` takes an optional `{maxRequests, windowMs}` override. The analytics route uses a much higher limit (300/min) than the 10/min default — Bangladeshi mobile carriers carrier-NAT huge numbers of users behind one IP, so the low default was silently dropping visit tracking for swaths of real users. Keep this in mind before reusing the default limit for anything IP-keyed that expects legitimate high-volume shared-IP traffic.
- **Location**: `lib/utils/geoBucket.ts` buckets Vercel's `x-vercel-ip-country`/`x-vercel-ip-city` headers into the 8 BD divisional cities + other/outside/unknown. No third-party geo service — Vercel provides these headers free on every request.
- `/admin` (`SiteAnalyticsSection.tsx`) surfaces: visits/trend/device/geo breakdown, retention (D1/D7/D30, approximated from `lastVisitAt` vs `createdAt` since there's no full visit history), a 30-day growth funnel, revenue/recharge analytics (from `recharge_requests`), a balance-integrity watchlist (flags accounts ≥10M coins for manual review), and full exportable Most-Active/Going-Quiet/Top-Coin-Holder lists (`app/api/admin/user-list`, `components/admin/UserExportList.tsx`).
- A separate `app/api/admin/user-analytics/route.ts` exists but is **not referenced by any page** — superseded by `admin/site-analytics`, safe to ignore or clean up.

## Firestore gotchas

- `.orderBy(field)` **excludes** any document missing that field entirely (not sorted last — omitted). This bit the "most active users" list before; the fix pattern is to fetch a full/bounded scan and sort in JS when you need "missing field = lowest" semantics instead of exclusion.
- `collectionGroup('simulator')` / `collectionGroup('trade_history')` queries need a composite index on first use — Firestore's error includes a one-click "create index" link (check Vercel function logs). Routes that use these degrade gracefully (catch + friendly error) rather than 500ing outright — follow that pattern.
- Combining an equality filter with a range filter on a *different* field needs a composite index too; several routes dodge this by filtering the second condition in JS after a single-field range query (see `activeRightNow` in `site-analytics/route.ts`).

## Branches & deployment

- `main` is the real branch; `preview` exists for `preview.stocksimulator.tech` but has drifted behind `main` before (missed several security-relevant commits) — check `git log main..preview` / `preview..main` before assuming preview reflects current code.
- Vercel auto-deploys on push. **`firestore.rules` does not** — changes need a manual `firebase deploy --only firestore:rules` from someone with the Firebase CLI logged in. On the user's Windows machine, a global `firebase` CLI (WinGet install) is already logged in and defaulted to this project (`.firebaserc` → `skilldash-c588d`) — confirmed working 2026-08-27 (`firebase deploy --only firestore:rules` succeeded from a Claude Code session there). Don't assume this on other machines/environments.
- `preview.stocksimulator.tech` previously had Vercel Deployment Protection (SSO gate) enabled, which silently 302'd every API call including chart data — if "X doesn't work on preview but works on prod" comes up again, check that setting first before assuming a code bug.

## Stock market category (A/B/G/N/Z)

- `stock.category` (rendered as badges throughout the UI — `GP[A]`, holding rows, the Portfolio diversification breakdown) comes from `artifacts/{appId}/public/data/market_info/categories`, merged onto each stock client-side in `hooks/useSimulator.ts` (`categoryMap[stock.symbol] || stock.category`).
- **This Firestore doc had no writer for a long time.** `api/market_sync.py` never scraped a category field, and nothing else wrote to that path (`firestore.rules` denies the client write, same as `market_info/latest`) — every category badge in the app rendered nothing until `api/category_sync.py` + `app/api/category-sync/route.ts` were added (2026-08-24) to fix it.
- Source: `https://www.dsebd.org/latest_share_price_scroll_group.php?group={A,B,G,N,Z}` — DSE's own category board, one request per category. Its HTML is malformed (a single `<tbody>` opener followed by a stray `</tbody>` after nearly every row, never reopened), so `category_sync.py`'s parser deliberately does **not** track `<tbody>` boundaries — it scopes itself to the one `<table class="...shares-table...">` via `<table>`/`</table>` only, which round-trip correctly.
- Verified against the live site: ~395 symbols total across all five categories, zero symbols in more than one category. G and N were both empty (0 symbols) on the verification date — that's a legitimate DSE state (few/no newly-listed or "G"-category names at the time), not a scrape failure.
- `app/api/category-sync/route.ts` mirrors `app/api/stock-sync/route.ts`'s exact `CRON_SECRET` auth pattern, so it's a drop-in addition to whatever external scheduler already calls `/api/stock-sync` — just point one more entry at `/api/category-sync`, same secret. Unlike price sync's 3-minute cadence, category is a slow-moving administrative fact; once daily is more than enough, and hitting DSE's category board every few minutes would be pointless load on their server. Scheduled for 10:15 Asia/Dhaka daily (15 min after market open) on the external cron.
- **Fail-safes, three layers, none of which trust a single signal:** (1) `category_sync.py` fetches all five category boards concurrently via `ThreadPoolExecutor`, each retried up to 3 times — sequential fetching with retries could exceed the 60s Vercel function ceiling on a slow day and get the whole invocation killed mid-run instead of failing cleanly; parallel takes ~1s on a healthy day, comfortably under the ceiling even in a worst-case all-retries scenario. (2) A category that errors after every retry is reported explicitly (`errors: {group: message}`) rather than silently folded into "0 symbols" — the route treats any reported error as a hard failure (502), since an unreachable board is not the same thing as a legitimately empty one (G and N are sometimes genuinely 0). (3) The route compares the new sync's total against the *previous* `totalCategorized` stored in Firestore and refuses to overwrite it if the new count is more than 15% lower (`MAX_DROP_FRACTION`) — real DSE category moves are a slow trickle, so a same-day double-digit-percent drop means the scrape broke, not that DSE recategorized half the market. On any of these three rejections the previous good data is left untouched; nothing is ever overwritten with a suspect result.

## Stock industry sector (lankabd.com failover-plan Scraper A)

- `stock.sector` (e.g. "Bank", "Pharmaceuticals & Chemicals") comes from `artifacts/{appId}/public/data/market_info/sectors`, merged onto each stock client-side in `hooks/useSimulator.ts` (`sectorMap[stock.symbol] || stock.sector`), same pattern as `category`. Unlike `category`, there's no `dsebd.org` fallback field — DSE's own boards never publish an industry/sector field at all, which is *why* this reaches outside DSE to `lankabd.com` (LankaBangla Financial Portal) instead of adding one more dsebd.org endpoint.
- Source: `https://lankabd.com/Home/DataMatrix` — a single GET returns the entire ~413-symbol table server-rendered in the initial HTML (confirmed 2026-08-24: `robots.txt` 404s, page carries `<meta name="robots" content="index,follow">`, no login wall, no JS execution needed). `api/lanka_sector_sync.py`'s parser scopes itself to `<table id="TableDataMatrix">` — only two `<table>` tags exist on the whole page, so plain `<table>`/`</table>` tracking is safe here (no malformed-tbody workaround needed, unlike `category_sync.py`). Each row's symbol comes from the *first* anchor with non-empty text in cell 0 (a second, text-less market-depth icon anchor sits right after it in the same cell), and sector comes from cell 2's plain text, HTML-unescaped and stored verbatim — it already matches the site's own canonical sector-dropdown values.
- This is a deliberately slow-cadence reference sync (roughly every two weeks — sector reclassification is rare, AGM-driven, never a mass shift), not a price feed, so it's on its own route rather than riding the 3-minute stock-sync cadence. `app/api/lanka-sector-sync/route.ts` mirrors `category-sync`'s exact `CRON_SECRET` auth pattern — same drop-in-one-more-cron-entry story — but **still needs that external cron entry added** (same as category-sync did); this repo has no in-repo scheduler.
- **Diff-and-only-write, not blind overwrite:** every run updates a cheap `lastChecked` timestamp regardless, but the full `sectors` map, `lastChanged`, and a changelog entry are only written when the scrape actually differs from what's stored (`sectors/changelog/{id}` — a free audit trail of real reclassifications, added/removed/changed per symbol). Most biweekly runs will see zero real-world movement and should cost exactly one cheap merge-write, not a full rewrite.
- **Fail-safes, mirroring `category_sync.py`'s layers:** (1) transport failures (timeout/5xx) retry up to 3x with backoff; a detected block signal (403/429, or a response body far smaller than the healthy ~2MB page) does **not** retry — retrying into an active block just extends it, so it's reported immediately instead. (2) A parsed result under `MIN_TOTAL_SYMBOLS` (100) is rejected as a parse failure — checked in both the Python function and, redundantly, the Next.js route. (3) The route also refuses to overwrite good data if the new total is more than 15% below the previous known-good `totalSectors` (`MAX_DROP_FRACTION`), same reasoning as category-sync's drop guard. Any rejection leaves the previously stored data untouched.
- UI: `/trade`'s market board (`app/trade/page.tsx`) has a horizontal-scrolling industry tab strip (derived dynamically from whatever sectors are actually present in the loaded stock list — nothing hardcoded) that filters the board alongside the existing search box. It only renders once `market_info/sectors` has data, so it degrades to "no tabs" gracefully rather than showing an empty/broken filter row before the first sync ever runs.
## Stock price failsafe (lankabd.com Scraper B)

- `api/market_sync.py`/`app/api/stock-sync/route.ts` (the primary dsebd.org price feed, ~3-minute cadence) has never broken in production, but that's not something to trust indefinitely. `app/api/price-failsafe-sync/route.ts` is the backstop: it's meant to run on a similarly frequent external cron tick, but on every invocation it first just reads `market_info/latest.lastUpdated` and does nothing (one cheap Firestore read) unless that heartbeat is more than `STALE_THRESHOLD_MS` (15 min) old **and** the market is currently open per `isMarketOpenServer()` — outside trading hours, staleness doesn't mean anything, so it's a no-op.
- When it does activate, it calls `api/lanka_price_sync.py` (Scraper B), which scrapes the same `https://lankabd.com/Home/DataMatrix` table Scraper A already reads (same fetch/retry/block-detection code, same `TableDataMatrix` id) but pulls the price columns (LTP/Open/High/Low/Close/YCP/Change/%Change/Volume/Value) instead of sector. Output shape matches `market_sync.py`'s `stocks[]` exactly, so it's a drop-in write to `market_info/latest` — tagged `source: 'lankabd-failsafe'` so it's obvious which source is live. lankabd has no per-symbol trade-count column, so `trade` is always `0` here and `traded` is derived from `volume > 0` instead; `Value(Turnover)` is in millions on that page and gets scaled ×1,000,000 to match the primary's raw-BDT shape — a best-effort conversion for a secondary/display field, not something the failsafe's correctness depends on (LTP/OHLC are unaffected).
- The next real `stock-sync` write is a full `.set()` (no merge), so recovery is automatic — no special-case code needed to "clean up" the failsafe's fields once the primary is healthy again.
- **Resend admin alert:** `lib/resendAdmin.ts` (`sendAdminAlertEmail()`) is a shared helper factored out of the coin-recharge notification email (`app/api/coins/send-recharge-email/route.ts`, which now calls the same helper) — same `RESEND_API_KEY`/`ADMIN_EMAIL`/`ADMIN_EMAIL_CC`/`RESEND_FROM_EMAIL` envs. `price-failsafe-sync` emails the admin on three transitions: failsafe activated (lankabd scrape succeeded), the more urgent dual-failure case (primary stale **and** the lankabd scrape also failed — `market_info/latest` is left untouched in this case, stale-but-real beats overwriting with nothing), and recovery. State for cooldown/recovery detection lives in `market_info/failsafeStatus` (`active`, `activatedAt`, `lastAlertSentAt`, `primaryLastUpdated`) — while an outage is ongoing, re-alerts are capped to once per hour (`ALERT_COOLDOWN_MS`) rather than every cron tick.
- **Needs an external cron entry**, same story as `category-sync`/`lanka-sector-sync`: this repo has no in-repo scheduler, so `/api/price-failsafe-sync` (same `CRON_SECRET` bearer-token auth pattern as the other sync routes) needs to be added to whatever external cron already calls `/api/stock-sync` — a similarly frequent cadence (e.g. every 3-5 minutes) makes sense since the whole point is catching an outage promptly, but the route is cheap to call when everything's healthy.

## Money/date formatting

- `lib/utils/money.ts`: paisa-based (integer-cent) math — `toPaisa`, `fromPaisa`, `moneyAdd/Subtract/Multiply`, `roundMoney`, `COMMISSION_RATE`. Shared by both the client hook (fast display math) and the server trade route (authoritative) so they can never disagree.
- `lib/utils/dhakaTime.ts`: `getDhakaDateKey`, `dhakaDateKeyToUtcMidnightISO`, `getLastNDhakaDateKeys`, `isoToDhakaDateKey`, `dhakaDaysSince`, `getDhakaHour` — use these instead of hand-rolling UTC+6 math.

## Known stale/unused (as of this writing)

- `@google/generative-ai`, `groq-sdk`, `@perplexity-ai/perplexity_ai`, `@ai-sdk/perplexity` are installed dependencies **not imported anywhere in the app**. No AI-analysis feature currently exists despite the now-removed legacy `coinManagerServer.ts` having had an `'ai_analysis'`-flavored gating concept in its history.
- `firestore.rules` has a `short_links/{code}` collection with rules, but there's no app route or component that reads/writes it — the URL-shortener feature referenced in old docs isn't actually implemented.
- No Capacitor dependency exists despite the Android APK — it's a Trusted Web Activity built externally via [PWABuilder](https://www.pwabuilder.com/), not something this repo's build produces. Distributed as a GitHub Release asset (not `/public` — see README's Download section), package id `tech.stocksimulator.zaifears`. The signing keystore lives outside this repo entirely (gitignored, never committed) — whoever owns it is the only one who can publish an update under this exact package id.
- `app/debug` and `app/api/debug-info` were removed (dead, non-functional, unlinked) in a prior cleanup — don't recreate a `/debug` route without gating it behind real admin auth on both the page and the API.

## Verifying changes without a full build

```bash
npx --no-install tsc --noEmit --jsx react-jsx --esModuleInterop --skipLibCheck \
  --target es2020 --module esnext --moduleResolution bundler --lib es2020,dom <file>
```

Filter for `TS1[0-9]{3}|TS17008|Unexpected|Unterminated|has no corresponding` and ignore `Cannot find module` noise (no `node_modules`/`tsconfig` in a single-file check). For real cross-file type safety, `npx tsc --noEmit` against the whole project also works and is fast enough to run before committing.

Python files under `api/` (Vercel serverless, not Next.js) don't run under `next dev` — test their logic by fetching the live/deployed endpoint, or by reading the scraped HTML directly with `curl` if debugging a parsing issue (see `api/dse_chart.py`'s DSE archive table column mapping for a past example of a parsing bug that only showed up against real HTML).
