/**
 * Single source of truth for the site's public origin.
 *
 * Every canonical, sitemap entry, OpenGraph URL and schema.org `url` must come
 * from here. The site is scheduled to move off stocksimulator.tech before it
 * expires on 2027-06-18 (see REDIRECT.md), and that migration should be one
 * environment variable change, not a hunt through a dozen files.
 *
 * Set NEXT_PUBLIC_MAIN_DOMAIN in Vercel. The literal below is only a local
 * development fallback.
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://www.stocksimulator.tech'
).replace(/\/+$/, '');

/**
 * Absolute URL for a site-relative path. `absoluteUrl('/blog')` and
 * `absoluteUrl('blog')` both work; `absoluteUrl()` returns the origin.
 */
export function absoluteUrl(path: string = '/'): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`;
}

/** Hostname only, e.g. for display or comparisons. */
export function siteHost(): string {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return SITE_URL.replace(/^https?:\/\//, '');
  }
}
