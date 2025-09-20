'use client';

import React, { useEffect, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import LearnHeroSection from '../../components/learn-skill/LearnHeroSection';
import GPAcademyCard from '../../components/learn-skill/GPAcademyCard';

// FIXED: Proper dynamic imports for Next.js 15
const LearningFeatures = dynamic(
  () => import('../../components/learn-skill/LearningFeatures'),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl mb-24" />,
    ssr: false
  }
);

const Footer = dynamic(
  () => import('../../components/shared/Footer'),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl" />,
    ssr: false
  }
);

// Optimized loading screen
const AuthLoadingScreen = () => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
  </div>
);

export default function LearnSkillPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to access learning resources. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/learn-skill');
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      {/* OPTIMIZED: Reduced animated background elements from 4 to 2 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-optimized-bounce" 
          style={{ animationDelay: '0s', animationDuration: '4s' }}
        />
        <div 
          className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-optimized-bounce" 
          style={{ animationDelay: '2s', animationDuration: '3.5s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14 relative z-10">
        {/* Hero Section */}
        <LearnHeroSection />

        {/* GP Academy Feature Card */}
        <GPAcademyCard />

        {/* Learning Features Section - Wrapped in Suspense */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl mb-24" />}>
          <LearningFeatures />
        </Suspense>

        {/* Footer - Wrapped in Suspense */}
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl" />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
