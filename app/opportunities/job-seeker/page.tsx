'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getJobOpportunities, formatJobOpportunity, JobOpportunity, FormattedJobOpportunity } from '../../../lib/contentful';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Helper Icons
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

// Loading component
const AuthLoadingScreen = () => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
  </div>
);

// ✅ Updated Job Card Component - THIS IS WHERE THE UPDATE GOES
const JobCard: React.FC<{ job: JobOpportunity }> = ({ job }) => {
  // ✅ Use the helper function to get properly typed data
  const formattedJob = formatJobOpportunity(job);
  
  return (
    <Link href={`/opportunities/job-seeker/${job.sys.id}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${formattedJob.isExpired ? 'opacity-60' : ''}`}>
        {/* Header */}
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location */}
          <div className="flex items-start space-x-2">
            <MapPinIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedJob.location}</p>
            </div>
          </div>

          {/* Education */}
          <div className="flex items-start space-x-2">
            <AcademicCapIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Education:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedJob.educationalRequirement}</p>
            </div>
          </div>

          {/* Deadline - with proper date formatting */}
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

        {/* View Details Button */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Click to view full details</span>
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

// ✅ Main Job Seeker Page Component
export default function JobSeekerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobOpportunity[]>([]); // ✅ Updated type
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to view job opportunities. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/opportunities/job-seeker');
      router.push('/auth');
      return;
    }

    if (user) {
      fetchJobs();
    }
  }, [user, loading, router]);

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

  // ✅ Updated filtering logic to use formatted job data
  const filteredJobs = jobs.filter(job => {
    const formatted = formatJobOpportunity(job);
    return (
      formatted.positionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatted.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatted.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/opportunities" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Opportunities
          </Link>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Job <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Opportunities</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover amazing career opportunities from top companies. Find your perfect match and take the next step in your career.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No jobs found' : 'No opportunities available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'opportunity' : 'opportunities'}
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* Job Grid - Using the updated JobCard component */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.sys.id} job={job} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
