'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useJobData } from '../../../hooks/useJobData';
import LoadingScreen from '../../../components/job-seeker/LoadingScreen';
import ErrorScreen from '../../../components/job-seeker/ErrorScreen';

// Lazy load heavy components
const JobSeekerHeader = dynamic(() => import('../../../components/job-seeker/JobSeekerHeader'), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const JobsList = dynamic(() => import('../../../components/job-seeker/JobsList'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

export default function JobSeekerPage() {
  const { jobs, isLoading, isTimeout, error, refetch } = useJobData();

  if (error) {
    return (
      <ErrorScreen
        title="Connection Error"
        message={error}
        onRetry={refetch}
        icon="🔄"
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen isTimeout={isTimeout} onRetry={isTimeout ? refetch : undefined} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <JobSeekerHeader jobCount={jobs.length} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <JobsList jobs={jobs} />
      </div>
    </div>
  );
}
