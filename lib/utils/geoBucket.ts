// lib/utils/geoBucket.ts
// Buckets a visitor's request into a coarse location for the admin traffic
// map. Vercel adds IP-geolocation headers to every request at the edge
// (x-vercel-ip-city / -country / -country-region) at no extra cost and no
// new dependency — this just normalizes that into the fixed set of
// divisional cities the dashboard cares about.

export const BD_GEO_BUCKETS = [
  { key: 'dhaka', label: 'Dhaka' },
  { key: 'chattogram', label: 'Chattogram' },
  { key: 'khulna', label: 'Khulna' },
  { key: 'rajshahi', label: 'Rajshahi' },
  { key: 'sylhet', label: 'Sylhet' },
  { key: 'barishal', label: 'Barishal' },
  { key: 'rangpur', label: 'Rangpur' },
  { key: 'mymensingh', label: 'Mymensingh' },
  { key: 'other_bd', label: 'Other (Bangladesh)' },
  { key: 'outside_bd', label: 'Outside Bangladesh' },
  { key: 'unknown', label: 'Unknown' },
] as const;

export type GeoBucketKey = (typeof BD_GEO_BUCKETS)[number]['key'];

// MaxMind (which Vercel's geo headers are sourced from) sometimes still
// returns older English spellings/names, so both are matched.
const CITY_ALIASES: Record<string, GeoBucketKey> = {
  dhaka: 'dhaka',
  chattogram: 'chattogram',
  chittagong: 'chattogram',
  khulna: 'khulna',
  rajshahi: 'rajshahi',
  sylhet: 'sylhet',
  barishal: 'barishal',
  barisal: 'barishal',
  rangpur: 'rangpur',
  mymensingh: 'mymensingh',
  mymensing: 'mymensingh',
};

/**
 * Reads Vercel's IP-geolocation headers off an incoming request and buckets
 * them into one of BD_GEO_BUCKETS. Header values are URL-encoded per
 * Vercel's docs, hence the decodeURIComponent.
 */
export function bucketGeoHeaders(headers: Headers): GeoBucketKey {
  const rawCountry = headers.get('x-vercel-ip-country');
  const rawCity = headers.get('x-vercel-ip-city');

  if (!rawCountry) return 'unknown';

  const country = safeDecode(rawCountry).toUpperCase();
  if (country !== 'BD') return 'outside_bd';

  const city = safeDecode(rawCity || '').toLowerCase().trim();
  if (!city) return 'other_bd';

  return CITY_ALIASES[city] || 'other_bd';
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
