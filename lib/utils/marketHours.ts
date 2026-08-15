// lib/utils/marketHours.ts
// Authoritative, server-side market-open check for the trade API
// (app/api/simulator/trade/route.ts).
//
// Mirrors hooks/useSimulator.ts's isMarketOpen() exactly: same BD-time
// conversion (UTC+6), same Fri/Sat weekend, same 10:00-14:15 trading window.
// The one deliberate difference is the holiday source — the client's
// isMarketOpen() reads from React state populated by
// lib/bangladeshHolidays.ts's getUpcomingHolidays(), which calls a relative
// `/api/holidays` URL that only resolves inside a browser. Server-side we go
// straight to that same file's getHolidayDetails(), which is synchronous and
// reads the local BD_HOLIDAYS dataset directly — no network dependency in
// the authoritative path.
import { getHolidayDetails } from '@/lib/bangladeshHolidays';

export function isMarketOpenServer(now: Date = new Date()): boolean {
  // Mirrors the client's preview-mode override.
  if (process.env.NEXT_PUBLIC_IS_PREVIEW_MODE === 'true') {
    return true;
  }

  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const hour = bdTime.getUTCHours();
  const minute = bdTime.getUTCMinutes();
  const dayOfWeek = bdTime.getUTCDay();
  const year = bdTime.getUTCFullYear();
  const dateStr = `${year}-${String(bdTime.getUTCMonth() + 1).padStart(2, '0')}-${String(bdTime.getUTCDate()).padStart(2, '0')}`;

  if (dayOfWeek === 5 || dayOfWeek === 6) return false; // Friday & Saturday weekend

  const holidayDates = [...getHolidayDetails(year), ...getHolidayDetails(year + 1)].map((h) => h.date);
  if (holidayDates.includes(dateStr)) return false;

  return hour >= 10 && (hour < 14 || (hour === 14 && minute <= 15));
}
