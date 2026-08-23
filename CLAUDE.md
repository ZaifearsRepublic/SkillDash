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
  market_sync.py                live price sync
  run_market.py, run_chart.py   related sync entry points
components/
  admin/                        SiteAnalyticsSection.tsx, UserExportList.tsx, RechargeList.tsx
  simulator/trade/               TradeModal.tsx
  shared/                       Footer.tsx etc.
lib/
  coinManagerServer.ts          legacy `users.coins` gating currency (NOT the trading balance)
  utils/                        money.ts, marketHours.ts, dhakaTime.ts, geoBucket.ts,
                                 persistentRateLimit.ts, simulatorBalances.ts, fetchWithToken.ts,
                                 adminVerification.ts
  contentful.ts, contentful-blog.ts   blog CMS client
  dseStocks.ts, dseCompanyNames.ts, bangladeshHolidays.ts
firestore.rules
```

## Two currencies — don't confuse them

- **`users/{uid}.coins`** — legacy currency (`lib/coinManagerServer.ts`), gates "premium"/AI-analysis-style features via signup/daily/referral bonuses. **Not the trading currency.**
- **`artifacts/{appId}/users/{uid}/simulator/state.balance`** — the real BDT-equivalent trading currency. `appId` = `process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'stocksimulatorbd-dse-v1'`. Credited by bKash recharge approval, spent/earned by trading.

Any analytics or admin "coins" feature must read the second one — use `lib/utils/simulatorBalances.ts`'s `getAllUserBalances()`, not `users.coins`.

## Trading is fully server-side

`hooks/useSimulator.ts`'s `executeTrade()` does **not** write Firestore directly — it POSTs to `app/api/simulator/trade/route.ts`, which is the only thing allowed to write `simulator/state`. That route:
- re-derives price from `artifacts/{appId}/public/data/market_info/latest` (never trusts a client-submitted price)
- recomputes commission (`lib/utils/money.ts`, `COMMISSION_RATE = 0.004`)
- enforces the T+1 rule **per purchase lot** (`portfolio[].lots[]`, not just an aggregate `purchaseDate` — a past bug let same-day-purchased shares slip through if merged into an existing older position)
- enforces market hours via `lib/utils/marketHours.ts`'s `isMarketOpenServer()` (mirrors the client check in `useSimulator.ts`, but sources holidays from the local `bangladeshHolidays.ts` dataset, not the `/api/holidays` route — a relative fetch URL doesn't resolve server-side)
- re-enforces `SANE_BALANCE_CAP` (100,000,000) on the SELL path by hand, because **Admin SDK writes bypass `firestore.rules` entirely** — any privileged write path has to reimplement its own limits, rules alone won't catch it

This exists because of a real incident: `firestore.rules` used to allow direct client writes to `simulator/state`, and several accounts got balances tampered up to 10^31 via devtools. `firestore.rules` now only allows the client to `create` the brand-new-user zero-balance doc; everything else is `update, delete: if false`.

## Admin API pattern

- Admin-gated route: `verifyAdminAccess(req)` from `lib/utils/adminVerification.ts` (Firebase custom claim `admin===true`, falls back to `users/{uid}.role==='admin'`). Also `import '@/lib/coinManagerServer'` for its Admin-SDK-init side effect, plus `export const runtime='nodejs'; export const dynamic='force-dynamic';`.
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
- Vercel auto-deploys on push. **`firestore.rules` does not** — changes need a manual `firebase deploy --only firestore:rules` from someone with the Firebase CLI logged in; this repo's Claude Code sessions haven't had `firebase` CLI available.
- `preview.stocksimulator.tech` previously had Vercel Deployment Protection (SSO gate) enabled, which silently 302'd every API call including chart data — if "X doesn't work on preview but works on prod" comes up again, check that setting first before assuming a code bug.

## Money/date formatting

- `lib/utils/money.ts`: paisa-based (integer-cent) math — `toPaisa`, `fromPaisa`, `moneyAdd/Subtract/Multiply`, `roundMoney`, `COMMISSION_RATE`. Shared by both the client hook (fast display math) and the server trade route (authoritative) so they can never disagree.
- `lib/utils/dhakaTime.ts`: `getDhakaDateKey`, `dhakaDateKeyToUtcMidnightISO`, `getLastNDhakaDateKeys`, `isoToDhakaDateKey`, `dhakaDaysSince`, `getDhakaHour` — use these instead of hand-rolling UTC+6 math.

## Known stale/unused (as of this writing)

- `@google/generative-ai`, `groq-sdk`, `@perplexity-ai/perplexity_ai`, `@ai-sdk/perplexity` are installed dependencies **not imported anywhere in the app**. No AI-analysis feature currently exists despite `coinManagerServer.ts` having an `'ai_analysis'`-flavored gating concept in its history.
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
