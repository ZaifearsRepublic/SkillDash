import { SITE_URL } from './siteUrl';

// ✅ SAFE: Extract repeated constants
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_CONVERSATION_LENGTH: 24, // 12 exchanges (10 questions + 2 buffer for follow-ups)
  IRRELEVANT_THRESHOLD: 3,
  QUESTION_COUNT_THRESHOLD: 5,
} as const;

export const MESSAGES = {
  LOADING: 'Analyzing your information...',
  ERROR_GENERIC: 'Service temporarily unavailable',
  AUTH_REQUIRED: 'Please log in to continue',
} as const;

export const ROUTES = {
  AUTH: '/auth',
  COINS: '/coins',
  // The trading terminal lives at /trade. There is no /simulator route; the old
  // SIMULATOR key pointed at one and would have 404'd anyone who used it.
  TRADE: '/trade',
} as const;

// Domain configuration. Prefer importing SITE_URL from '@/lib/siteUrl' directly;
// this alias exists for older call sites. See REDIRECT.md for the planned move
// off stocksimulator.tech before it expires on 2027-06-18.
export const DOMAINS = {
  MAIN: SITE_URL,
} as const;

/**
 * Get full URL for a path on the main domain
 * Works across different deployments (production, Vercel preview, local)
 */
export function getMainUrl(path: string = ''): string {
  const baseUrl = DOMAINS.MAIN;
  if (!path) return baseUrl;
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
