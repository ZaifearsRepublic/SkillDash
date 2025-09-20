import React from 'react';
import Link from 'next/link';
import { JobOpportunity } from '../../lib/contentful';
import JobCard from './JobCard';

interface JobsListProps {
  jobs: JobOpportunity[];
}

const JobsList = React.memo<JobsListProps>(({ jobs }) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">💼</div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          No opportunities available yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
          We're working on bringing you amazing job opportunities. Check back soon!
        </p>
        <div className="mt-8">
          <Link 
            href="/opportunities" 
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Explore Other Options
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Found {jobs.length} {jobs.length === 1 ? 'opportunity' : 'opportunities'} for you
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.sys.id} job={job} />
        ))}
      </div>
    </>
  );
});

JobsList.displayName = 'JobsList';
export default JobsList;
