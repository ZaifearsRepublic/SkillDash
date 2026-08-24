'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isAppShellRoute } from '@/lib/appRoutes';

/**
 * The root <main>. Marketing pages need bottom padding to clear the site's
 * mobile bottom nav; app-shell routes supply their own spacing inside
 * components/app/AppShell.tsx, so the extra 64px here would leave a dead gap
 * under their tab bar.
 */
export default function SiteMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const inAppShell = isAppShellRoute(pathname);

  return (
    <main role="main" className={inAppShell ? '' : 'pb-16 lg:pb-0'}>
      {children}
    </main>
  );
}
