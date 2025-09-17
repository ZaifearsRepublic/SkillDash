import React from 'react';

const ConstructionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function UnderMaintenancePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-2xl w-full bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="text-blue-500 dark:text-blue-400 mx-auto mb-6 inline-block animate-pulse">
          <ConstructionIcon />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          We're Building Something Great
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          The hirer's portal is currently under construction. We're working hard to create a seamless experience for you to find the best student talent. Please check back soon!
        </p>
        <a
          href="/opportunities"
          className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          Return to Opportunities
        </a>
      </div>
    </div>
  );
}

