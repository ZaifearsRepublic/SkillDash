import React from 'react';

export default function UnderMaintenancePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-2xl w-full bg-white/50 dark:bg-black/50 backdrop-blur-lg p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="text-blue-500 dark:text-blue-400 mx-auto mb-6 inline-block animate-pulse">
          <img 
            src="/opportunities/job-seeker-under-construction.png" 
            alt="Under Construction" 
            className="h-16 w-16 object-contain mx-auto filter invert dark:invert-0"
          />
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