import React from 'react';
import Link from 'next/link';
import { BackIcon } from './JobIcons';

interface JobSeekerHeaderProps {
  jobCount: number;
}

const JobSeekerHeader = React.memo<JobSeekerHeaderProps>(({ jobCount }) => (
  <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/opportunities" 
          className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800"
        >
          <BackIcon />
          <span className="text-lg">Back to Opportunities</span>
        </Link>
      </div>
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Job <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Opportunities</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Discover amazing career opportunities from top companies. Find your perfect match and take the next step in your career journey.
        </p>
      </div>
    </div>
  </div>
));

JobSeekerHeader.displayName = 'JobSeekerHeader';
export default JobSeekerHeader;
