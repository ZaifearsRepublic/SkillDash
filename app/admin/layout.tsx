'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/lib/components/shared';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (loading) return;

      if (!user) {
        router.replace('/auth');
        return;
      }

      // Admin status comes from the signed custom claim only — matching
      // lib/utils/adminVerification.ts and firestore.rules' isAdmin().
      // This gate only decides whether to render the admin shell; every
      // admin API re-verifies the same claim server-side, so a bypass here
      // reveals an empty UI, not data.
      try {
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.admin === true) {
          setIsAdmin(true);
          setChecking(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to verify admin via token claims:', err);
      }

      router.replace('/');
    };

    verifyAdmin();
  }, [user, loading, router]);

  if (loading || checking) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {children}
    </div>
  );
}
