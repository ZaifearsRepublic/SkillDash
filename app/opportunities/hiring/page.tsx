'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import HiringHeader from '../../../components/hiring/HiringHeader';

// Lazy load heavy components for better initial page load
const ContactForm = dynamic(() => import('../../../components/hiring/ContactForm'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl" />
});

const BenefitsSection = dynamic(() => import('../../../components/hiring/BenefitsSection'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const ComingSoonFeatures = dynamic(() => import('../../../components/hiring/ComingSoonFeatures'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800" />
});

export default function HiringPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <HiringHeader />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <ContactForm />
          <BenefitsSection />
          <ComingSoonFeatures />
        </div>
      </div>
    </div>
  );
}
