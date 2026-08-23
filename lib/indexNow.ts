/**
 * IndexNow: a shared protocol Bing, Yandex, Seznam.cz and Naver all consume.
 * One submission to api.indexnow.org reaches every participant — there is no
 * per-engine integration needed. Google does not participate as of this
 * writing; Search Console and the sitemap remain the way to reach it.
 *
 * Ownership is proven by hosting a static key file at
 * `{SITE_URL}/{key}.txt` containing just the key. That file lives at
 * public/<key>.txt in this repo. If the key ever rotates, both the constant
 * below (or INDEXNOW_KEY) and the key file must change together and stay in
 * sync — a mismatch fails every submission with 403.
 *
 * When this site migrates off stocksimulator.tech (see REDIRECT.md), the key
 * file has to be re-hosted at the new domain, because `keyLocation` and every
 * submitted URL must share `host`.
 */
import { SITE_URL, siteHost } from './siteUrl';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'd05b525162794ca2b873dfa47648be57';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10_000;

export type IndexNowResult =
  | { ok: true; status: number; submitted: number }
  | { ok: false; status: number; error: string; submitted: number };

/**
 * Submit URLs to IndexNow. Every URL must belong to this site's host and be
 * an absolute URL under SITE_URL — mismatched or foreign URLs make the whole
 * batch fail with 422, so they are filtered out here before sending rather
 * than left for the API to reject.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const prefix = `${SITE_URL}/`;
  const clean = [...new Set(urls)].filter((u) => u === SITE_URL || u.startsWith(prefix));

  if (clean.length === 0) {
    return { ok: false, status: 0, error: 'No URLs for this host after filtering', submitted: 0 };
  }

  const host = siteHost();
  let submitted = 0;

  for (let i = 0; i < clean.length; i += MAX_URLS_PER_REQUEST) {
    const batch = clean.slice(i, i + MAX_URLS_PER_REQUEST);

    let res: Response;
    try {
      res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList: batch }),
      });
    } catch (err) {
      return { ok: false, status: 0, error: err instanceof Error ? err.message : 'Network error', submitted };
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: body || res.statusText, submitted };
    }

    submitted += batch.length;
  }

  return { ok: true, status: 200, submitted };
}

/** Convenience for the common case: one page just changed. */
export function submitUrlToIndexNow(url: string): Promise<IndexNowResult> {
  return submitToIndexNow([url]);
}
