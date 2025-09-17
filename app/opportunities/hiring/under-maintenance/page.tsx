import React from 'react';

const ConstructionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 0 1 0 4m-6 8a2 2 0 100-4m0 4a2 2 0 1 0 0 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 1 0-4 0m0 0a2 2 0 0 1 4 0m0 0v-2m0 2h2" />
  </svg>
);

export default function UnderMaintenance() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 p-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
          <ConstructionIcon />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Under Maintenance</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          We're working hard to bring you the best hiring opportunities. Check back soon!
        </p>
        <a 
          href="/opportunities" 
          className="inline-block bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all"
        >
          Back to Opportunities
        </a>
      </div>
    </div>
  );
}