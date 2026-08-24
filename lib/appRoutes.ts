// lib/appRoutes.ts
// Which routes render inside the broker app shell (components/app/AppShell.tsx)
// rather than as ordinary marketing/web pages.
//
// Shell routes get: the persistent market strip, the 5-tab bottom bar, and no
// site navbar or footer. Everything else keeps the standard web chrome.
//
// IMPORTANT: this list must only contain routes whose page actually renders
// <AppShell> (see components/app/AppShell.tsx). NavbarWrapper and SiteMain
// both key off it to suppress the marketing navbar/footer spacing — adding a
// route here that ISN'T wrapped in AppShell leaves that page with no
// navigation chrome at all.
//
// Keep the SEO-critical force-static /stocks directory and its ~400 indexed
// symbol pages OFF this list — putting them behind the shell's auth gate
// would de-index them. /coins and /profile require login already (their own
// pages redirect to /auth), so wrapping them here costs nothing SEO-wise;
// their layout.tsx files still export the same metadata independent of how
// the client page inside them renders.
export const APP_SHELL_ROUTES = ['/trade', '/portfolio', '/coins', '/profile'] as const;

export function isAppShellRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return APP_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
