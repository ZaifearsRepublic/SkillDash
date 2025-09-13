import React from 'react';

// A simple inline SVG to replace the react-icons dependency
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black text-center px-4">
      <div className="w-24 h-24 p-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/50 rounded-2xl mb-6 text-yellow-500">
        <BriefcaseIcon />
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-4">
        Job & Freelance Opportunities
      </h1>
      <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Coming soon! This is where you'll find a curated list of part-time jobs and freelance gigs tailored to your skills. Start earning and gaining experience while you study.
      </p>
    </div>
  );
}

