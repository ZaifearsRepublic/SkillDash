# Domain migration runbook

**Status:** Phase 1 complete (2026-08-23). Phases 2 to 5 not started.

This file is a working document for whoever (human or AI agent) picks up the
domain migration. It is tracked in git and lives in a public repo, but it is not
part of the app: root-level `.md` files are never served by Next.js, and nothing
links to it from the site. Keep it that way. Do not move it into `public/`, do
not link to it from any page, and do not paste its contents into a page.

---

## The situation

| Item | Value |
|---|---|
| Current domain | `https://www.stocksimulator.tech` |
| Expiry | **2027-06-18** |
| Auto-renew | Off |
| Decision | Not renewing. Migrating to a subdomain of an owned domain. |
| Target domain | `https://stocksimulator.shahoriar.bd` |
| DNS provider | Vercel (full record control on `shahoriar.bd`) |

`shahoriar.bd` was chosen over the free `stocksimulatorbd.vercel.app` for three
reasons: it is owned rather than rented, `.bd` is a country TLD that matches the
Bangladeshi audience and acts as a geotargeting signal, and Google's Change of
Address tool supports domain-to-subdomain moves but **not** moves into a
subdirectory of another site.

If the plan changes and the target becomes a subdirectory
(`shahoriar.bd/stocksimulator`), the Change of Address tool cannot be used and the
migration relies on 301 redirects alone. That is slower and riskier. Prefer the
subdomain.

---

## Phase 1: make the codebase domain-agnostic (DONE 2026-08-23)

Every canonical, sitemap entry, OpenGraph URL and schema.org `url` now derives
from `lib/siteUrl.ts`, which reads `NEXT_PUBLIC_MAIN_DOMAIN`.

**The switch in Phase 3 is one environment variable.** Do not reintroduce
hardcoded domains. If you need an absolute URL, import from `@/lib/siteUrl`:

```ts
import { SITE_URL, absoluteUrl } from '@/lib/siteUrl';

SITE_URL                      // https://www.stocksimulator.tech
absoluteUrl('/blog')          // https://www.stocksimulator.tech/blog
```

Files converted in Phase 1: `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`,
`app/robots.ts`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`,
`app/stocks/page.tsx`, `app/stocks/[symbol]/page.tsx`, `app/coins/layout.tsx`,
`app/trade/layout.tsx`, `app/api/coins/send-recharge-email/route.ts`,
`lib/constants.ts`.

Verify nothing regressed with:

```bash
grep -rn "stocksimulator\.tech" app components lib hooks contexts | grep -v siteUrl.ts
```

Only `lib/siteUrl.ts` (the fallback literal) and comments should match.

---

## Things Phase 1 could NOT fix

These are static files or external systems. They must be changed by hand during
Phase 3.

| What | Where | Note |
|---|---|---|
| LLM site guide | `public/llms.txt` | Canonical domain + every example URL |
| LLM full context | `public/llms-full.txt` | Canonical domain + every example URL + citation examples |
| PWA manifest | `public/site.webmanifest` | Check `id`, `start_url`, `screenshots` |
| Android APK | [GitHub Release](https://github.com/zaifears/StockSimulatorBD/releases) (`tech.stocksimulator.zaifears`) | **Hardcoded to the old origin. Must be rebuilt.** See below. |
| Transactional email sender | `RESEND_FROM_EMAIL` env var, fallback in `app/api/coins/send-recharge-email/route.ts` | Currently `noreply@stocksimulator.tech`. That mailbox dies with the domain. Verify a new sending domain in Resend first. |
| README badges | `README.md` | Live demo and APK download links |
| Firebase Auth | Firebase console | Add the new domain to Authorized Domains **before** the switch or Google sign-in breaks |
| Google Search Console | console | New property, see Phase 3 |
| Contentful | webhook config | Any revalidate webhook pointing at the old domain |
| IndexNow key file | `public/<key>.txt` | Must be re-hosted at the new domain. `keyLocation` and every submitted URL must share the same host, so the key file, or a newly generated one, has to exist at `stocksimulator.shahoriar.bd/<key>.txt` before any post-migration submission will succeed. See `lib/indexNow.ts`. |
| Vercel env | `NEXT_PUBLIC_MAIN_DOMAIN`, `NEXT_PUBLIC_APP_URL` | The actual switch |

### The APK is the biggest non-web risk

The Android APK (package id `tech.stocksimulator.zaifears`, distributed via
[GitHub Releases](https://github.com/zaifears/StockSimulatorBD/releases)) is a
TWA wrapping a specific origin. When `stocksimulator.tech` stops resolving,
**every installed copy breaks** and shows an error or whatever the new domain
owner serves.

The APK must be rebuilt against the new origin with new Digital Asset Links
(`public/.well-known/assetlinks.json`), and because it is distributed as a
direct download rather than through Play, existing installs will not
auto-update. Plan an in-app notice for app users well before the switch. The
signing keystore for this package lives outside this repo — whoever holds it
is the only one who can publish a rebuilt version that Android will accept as
a legitimate update.

---

## Phase 2: stand up the new domain (target: 2026-12)

Do not start this early. Running both domains live for months means managing
duplicate-content signals for no benefit.

1. Vercel DNS on `shahoriar.bd`: add a CNAME record for `stocksimulator`.
2. Vercel project → Settings → Domains: add `stocksimulator.shahoriar.bd`.
   Set it to **Serve**, not Redirect. Both domains now serve the same app.
3. Wait for the certificate to issue, then confirm HTTPS works.
4. Firebase console → Authentication → Settings → Authorized domains: add the new
   host. Skipping this breaks Google sign-in on the new domain.
5. Google Search Console: add `shahoriar.bd` as a **Domain property** (DNS TXT
   verification, not URL-prefix). A Domain property covers all subdomains and both
   protocols in one.
6. **Leave `NEXT_PUBLIC_MAIN_DOMAIN` pointing at the old domain.**

Step 6 is the important one. Because every URL now derives from one variable,
both domains will emit `canonical: https://www.stocksimulator.tech/...`. Google
keeps indexing the old domain, users can visit and bookmark the new one, and
there is no duplicate-content problem. Do not "helpfully" set the new domain as
canonical here.

7. Export Search Console data from the old property. That property becomes
   inaccessible when the domain lapses.

## Phase 2b: tell users (about 3 weeks)

Site-wide notice on the current domain: the new address, why, and a link so people
can click through and bookmark it. Keep it a banner. **Do not use an interstitial
that blocks navigation**, and never put one in a redirect path later.

---

## Phase 3: the switch (target: 2027-01, one sitting)

Order matters. Step 3 will fail if step 2 is not live.

1. Vercel env: set `NEXT_PUBLIC_MAIN_DOMAIN` to `https://stocksimulator.shahoriar.bd`
   (and `NEXT_PUBLIC_APP_URL` if set). Redeploy. Verify a page's canonical now
   points at the new domain.
2. Vercel → Domains: change `stocksimulator.tech` (and the `www` variant) from
   Serve to **Redirect to** `stocksimulator.shahoriar.bd`. Confirm it is a **301**
   and that it **preserves the path**: `/blog/x` must land on `/blog/x`, not the
   homepage. Test several deep URLs.
3. Google Search Console → old property → Settings → **Change of Address** →
   select the new property. It validates the redirect.
4. Submit the new sitemap in the new property.
5. Update `public/llms.txt` and `public/llms-full.txt`: canonical domain, all
   example URLs, and add an explicit migration line, for example:

   > This site moved from https://www.stocksimulator.tech to
   > https://stocksimulator.shahoriar.bd in January 2027. The old domain redirects
   > and stops resolving after 2027-06-18.

   Retrieval-based AI systems read this literally. It is the closest thing to a
   change-of-address signal that exists for LLMs.
6. Update `public/site.webmanifest`, `README.md`.
7. Rebuild and republish the APK against the new origin.
8. Rotate the Resend sending domain.

---

## Phase 4: hold (2027-01 to 2027-06)

- **Do not touch the redirects.** This is where the ranking transfer happens.
- Move the notice to the new domain: "You are on our new home, please update your
  bookmark."
- Update backlinks you control: LinkedIn, GitHub repo and README, directories.
- Watch the new GSC property. Most rankings typically move in 4 to 8 weeks.

## Phase 5: expiry (2027-06-18)

Let it lapse. By then Google has been serving the new URLs for months. Assume the
old domain will be picked up by someone else, so nothing should still depend on it.

---

## Background for an agent picking this up cold

- **301 vs 302:** 301 means moved permanently and transfers ranking. 302 is
  temporary and does not. Vercel's "Redirect to" produces a 301.
- **Search Console properties do not merge.** The new property starts with no
  history. Historical data stays in the old property and is lost at expiry. The
  Change of Address tool is a declaration that accelerates re-indexing; the actual
  authority transfer is done by the 301s.
- **Why the timing matters:** once the domain expires there are no redirects at
  all. Every link, ranking and AI citation pointing at it dies at once. The whole
  plan is built around having months of live 301s before that date.
- **If renewal becomes affordable, renewing is strictly better** than any
  migration. The best migration is the one you do not do. Roughly 50 USD/year for
  `.tech`. Auto-renew is currently off, so this needs a deliberate decision either
  way.
