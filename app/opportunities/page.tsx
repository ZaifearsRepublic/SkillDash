'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import OpportunityHero from '../../components/opportunities/OpportunityHero';
import BackgroundAnimation from '../../components/shared/BackgroundAnimation';

// Lazy load heavy components
const JobSeekerSection = dynamic(() => import('../../components/opportunities/JobSeekerSection'), {
  loading: () => <div className="h-screen animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const Footer = dynamic(() => import('../../components/shared/Footer'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl" />
});

export default function OpportunitiesPage() {
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      {/* Background Animation */}
      <BackgroundAnimation />

      <div className="min-h-screen text-gray-800 dark:text-gray-200 relative z-10">
        {/* Top Section - Path Selection */}
        <OpportunityHero />

        {/* Job Seeker Section */}
        <JobSeekerSection />

        {/* Footer */}
        <div className="mx-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}
