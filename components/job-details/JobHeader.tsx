import React from 'react';
import Link from 'next/link';
import { FormattedJobOpportunity } from '../../lib/contentful';

interface JobHeaderProps {
  formattedJob: FormattedJobOpportunity;
}

const BackIcon = React.memo(() => (
  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
));
BackIcon.displayName = 'BackIcon';

const JobHeader = React.memo<JobHeaderProps>(({ formattedJob }) => (
  <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* UPDATED: Larger back button with better styling */}
      <Link 
        href="/opportunities/job-seeker" 
        className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800 mb-6"
      >
        <BackIcon />
        <span className="text-base">Back to Job Listings</span>
      </Link>
      
      <div className="mb-6">
        {formattedJob.isExpired && (
          <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-sm font-medium px-3 py-1 rounded-full mb-4">
            This job posting has expired
          </span>
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {formattedJob.positionName}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{formattedJob.company}</p>
      </div>
    </div>
  </div>
));

JobHeader.displayName = 'JobHeader';
export default JobHeader;
