import React from 'react';
import Link from 'next/link';
import { BackIcon } from '../icons/HiringIcons';

const HiringHeader = React.memo(() => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/opportunities" 
            className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800"
          >
            <BackIcon />
            <span className="text-lg ml-3">Back to Opportunities</span>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Hire Top <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Student Talent</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Connect with skilled, motivated students and recent graduates. Find your next intern, part-time employee, or entry-level hire from our verified talent pool.
          </p>
        </div>
      </div>
    </div>
  );
});

HiringHeader.displayName = 'HiringHeader';
export default HiringHeader;
