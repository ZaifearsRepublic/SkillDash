'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobOpportunities, formatJobOpportunity, JobOpportunity } from '../../../lib/contentful';

// Helper Icons (remains the same)
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const AcademicCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);
const BuildingOfficeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// New Loading Screen for public page
const LoadingScreen = () => (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
       <p className="text-gray-600 dark:text-gray-400 mt-4">Loading opportunities...</p>
    </div>
);

// Job Card Component
const JobCard: React.FC<{ job: JobOpportunity }> = ({ job }) => {
  const formattedJob = formatJobOpportunity(job);
  return (
    <Link href={`/opportunities/job-seeker/${job.sys.id}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${formattedJob.isExpired ? 'opacity-60' : ''}`}>
        <div className="mb-4">
          {formattedJob.isExpired && (
            <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full mb-2">
              Expired
            </span>
          )}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {formattedJob.positionName}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
            <BuildingOfficeIcon />
            <span className="ml-2 font-medium">{formattedJob.company}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <MapPinIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedJob.location}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <AcademicCapIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Education:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedJob.educationalRequirement}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2 sm:col-span-2">
            <CalendarIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline to Apply:</p>
              <p className={`text-sm font-medium ${formattedJob.isExpired ? 'text-red-600 dark:text-red-400 line-through' : 'text-red-600 dark:text-red-400'}`}>
                {formattedJob.formattedDeadline}
                {formattedJob.isExpired && <span className="ml-2 text-xs">(Expired)</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Login required to view details</span>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Main Public Job Seeker Page Component
export default function JobSeekerPage() {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const jobData = await getJobOpportunities();
      setJobs(jobData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/opportunities" className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">💼</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No opportunities available yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              We're working on bringing you amazing job opportunities. Check back soon!
            </p>
            <div className="mt-8">
              <Link href="/opportunities" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105">
                Explore Other Options
              </Link>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}