'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ModernNavbar from './ModernNavbar';
import { isAppShellRoute } from '@/lib/appRoutes';

export default function NavbarWrapper() {
  const pathname = usePathname();

  // Trading surfaces render their own chrome (components/app/AppShell.tsx):
  // a live market strip on top and a 5-tab broker bar at the bottom. Showing
  // the marketing navbar there too would stack two headers and two bottom
  // bars on a phone.
  if (isAppShellRoute(pathname)) return null;

  return <ModernNavbar />;
}
