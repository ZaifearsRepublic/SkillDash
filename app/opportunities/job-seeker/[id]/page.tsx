'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../../../contexts/AuthContext';
import { useJobDetails } from '../../../../hooks/useJobDetails';
import JobDetailsLoadingScreen from '../../../../components/job-details/JobDetailsLoadingScreen';
import ErrorScreen from '../../../../components/job-seeker/ErrorScreen';

// Lazy load heavy components
const JobHeader = dynamic(() => import('../../../../components/job-details/JobHeader'), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const JobRequirements = dynamic(() => import('../../../../components/job-details/JobRequirements'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

const JobSidebar = dynamic(() => import('../../../../components/job-details/JobSidebar'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

const RichTextRenderer = dynamic(() => import('../../../../components/job-details/RichTextRenderer'), {
  loading: () => <div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />
});

export default function JobDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { formattedJob, isLoading, isTimeout, error, refetch } = useJobDetails(params.id as string);

  // Handle authentication
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to view job details.');
      sessionStorage.setItem('redirectAfterLogin', `/opportunities/job-seeker/${params.id}`);
      router.push('/auth');
    }
  }, [user, loading, router, params.id]);

  // Loading states
  if (loading || !user) {
    return <JobDetailsLoadingScreen />;
  }

  if (error) {
    return (
      <ErrorScreen
        title="Unable to Load Job"
        message={error}
        onRetry={refetch}
        icon="🔄"
      />
    );
  }

  if (isLoading) {
    return <JobDetailsLoadingScreen isTimeout={isTimeout} onRetry={isTimeout ? refetch : undefined} />;
  }

  if (!formattedJob) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The job you're looking for might have been removed or doesn't exist.
          </p>
          <Link 
            href="/opportunities/job-seeker" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to Job Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <JobHeader formattedJob={formattedJob} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <JobRequirements requirements={formattedJob.requirements} />

            {/* Apply Procedure */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apply Procedure</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <RichTextRenderer content={formattedJob.applyProcedure} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <JobSidebar formattedJob={formattedJob} />
        </div>
      </div>
    </div>
  );
}
