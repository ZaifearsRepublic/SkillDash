import React, { Suspense, lazy } from 'react';
import TypingHeroSection from '../components/TypingHeroSection';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load heavy sections
const ContentSections = lazy(() => import('../components/ContentSections'));

export default function SkillDashHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Simplified animated background - only 2 circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s' }} 
        />
      </div>

      {/* Enhanced Hero Section with Big Typing Animation */}
      <TypingHeroSection />

      {/* Core Features Section */}
      <CoreFeaturesSection />

      {/* All other content sections - Lazy loaded */}
      <Suspense fallback={<LoadingSpinner />}>
        <ContentSections />
      </Suspense>
    </div>
  );
}
