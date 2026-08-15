/**
 * Dhaka (Asia/Dhaka, UTC+6, no DST) date-key helpers used by the site
 * visit-tracking system (app/api/analytics/track) and the admin analytics
 * API (app/api/admin/site-analytics).
 *
 * "dateKey" is always a "YYYY-MM-DD" string representing a calendar day in
 * Bangladesh local time — used as the Firestore doc id for daily analytics
 * rollups so that "today" matches what a Bangladesh-based admin expects,
 * regardless of which UTC region the server actually runs in.
 */

/**
 * Get a "YYYY-MM-DD" date key for a day `daysAgo` days before today, in
 * Dhaka local time. daysAgo = 0 → today (Dhaka).
 */
export function getDhakaDateKey(daysAgo: number = 0): string {
  const now = new Date();
  // This is the same trick already used in lib/dateFormatter.ts:
  // re-parsing the Dhaka wall-clock string gives a Date whose *local*
  // getters (getFullYear/getMonth/getDate) return the Dhaka Y/M/D,
  // regardless of the server process's actual timezone.
  const bd = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  bd.setDate(bd.getDate() - daysAgo);

  const y = bd.getFullYear();
  const m = String(bd.getMonth() + 1).padStart(2, '0');
  const d = String(bd.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convert a Dhaka-local "YYYY-MM-DD" date key to the UTC ISO timestamp of
 * that day's midnight in Dhaka (i.e. the correct absolute instant, since
 * Dhaka is a fixed UTC+6 offset with no DST). Safe to lexicographically
 * compare against other `new Date().toISOString()` strings (e.g.
 * `users.createdAt`), since both are normalized "...Z" UTC strings.
 */
export function dhakaDateKeyToUtcMidnightISO(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00+06:00`).toISOString();
}

/**
 * Last `n` Dhaka date keys, oldest first, ending with today.
 * getLastNDhakaDateKeys(7) on 2026-08-15 → [...,'2026-08-14','2026-08-15']
 */
export function getLastNDhakaDateKeys(n: number): string[] {
  return Array.from({ length: n }, (_, i) => getDhakaDateKey(n - 1 - i));
}

/**
 * Convert a full ISO timestamp (e.g. `users.createdAt`, a trade's
 * `timestamp`) to the "YYYY-MM-DD" Dhaka-local date key it falls on.
 */
export function isoToDhakaDateKey(iso: string): string {
  const d = new Date(iso);
  const bd = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const y = bd.getFullYear();
  const m = String(bd.getMonth() + 1).padStart(2, '0');
  const day = String(bd.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * True calendar-day difference (Dhaka local) between a date key and today.
 * Used to decide e.g. "has this account existed for at least 3 days" when
 * filtering out brand-new signups from an "inactive users" list.
 */
export function dhakaDaysSince(dateKeyOrIso: string): number {
  const todayKey = getDhakaDateKey(0);
  const today = new Date(`${todayKey}T00:00:00+06:00`).getTime();

  // Accept either a plain "YYYY-MM-DD" key or a full ISO timestamp.
  const asDateKey = dateKeyOrIso.length === 10 ? dateKeyOrIso : isoToDhakaDateKey(dateKeyOrIso);

  const target = new Date(`${asDateKey}T00:00:00+06:00`).getTime();
  return Math.round((today - target) / 86400000);
}

/**
 * Current hour-of-day (0–23) in Dhaka local time. Used to build a
 * "when are people actually on the site" activity-by-hour breakdown.
 */
export function getDhakaHour(date: Date = new Date()): number {
  const bd = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  return bd.getHours();
}
