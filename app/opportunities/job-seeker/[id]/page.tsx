'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getJobOpportunityById, formatJobOpportunity, JobOpportunity, FormattedJobOpportunity } from '../../../../lib/contentful';
import { useAuth } from '../../../../contexts/AuthContext';

// Enhanced Loading component with timeout
const AuthLoadingScreen: React.FC<{ 
  isTimeout?: boolean, 
  onRetry?: () => void 
}> = React.memo(({ isTimeout = false, onRetry }) => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center px-4">
    {!isTimeout ? (
      <>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-center">Loading job details...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait a moment</p>
      </>
    ) : (
      <>
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Taking longer than expected</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
          The server might be slow to respond. Would you like to try again?
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        )}
      </>
    )}
  </div>
));
AuthLoadingScreen.displayName = 'AuthLoadingScreen';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class JobDetailsErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Job details page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an error while loading job details. Please try again.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onRetry();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Optimized Rich Text Renderer with memoization
const RichTextRenderer: React.FC<{ content: any }> = React.memo(({ content }) => {
  const renderedContent = useMemo(() => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content && content.content) {
      return content.content.map((node: any, index: number) => {
        if (node.nodeType === 'paragraph') {
          return (
            <p key={index} className="mb-4">
              {node.content?.map((textNode: any, textIndex: number) => (
                <span key={textIndex}>{textNode.value}</span>
              )) || ''}
            </p>
          );
        }
        return null;
      });
    }
    
    return content || 'No content available';
  }, [content]);

  return (
    <div className="whitespace-pre-line text-gray-600 dark:text-gray-400 leading-relaxed">
      {renderedContent}
    </div>
  );
});
RichTextRenderer.displayName = 'RichTextRenderer';

export default function JobDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<JobOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize formatted job to prevent recalculation
  const formattedJob = useMemo(() => {
    return job ? formatJobOpportunity(job) : null;
  }, [job]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      setIsTimeout(false);
      setError(null);

      // Set timeout for loading state
      const timeoutId = setTimeout(() => {
        setIsTimeout(true);
      }, 10000); // Show timeout message after 10 seconds

      const jobData = await getJobOpportunityById(params.id as string);
      
      clearTimeout(timeoutId);
      
      if (jobData) {
        setJob(jobData);
      } else {
        setError('Job not found');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to load job details. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTimeout(false);
    }
  };

  useEffect(() => {
    // Handle authentication
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to view job details.');
      sessionStorage.setItem('redirectAfterLogin', `/opportunities/job-seeker/${params.id}`);
      router.push('/auth');
      return;
    }

    // Fetch job details when user is authenticated
    if (user && params.id) {
      fetchJobDetails();
    }
  }, [user, loading, router, params.id]);

  const handleRetry = () => {
    fetchJobDetails();
  };

  // Loading states
  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Job</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/opportunities/job-seeker" 
              className="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-semibold transition-colors text-center"
            >
              Back to Job Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <AuthLoadingScreen isTimeout={isTimeout} onRetry={isTimeout ? handleRetry : undefined} />;
  }

  if (!job || !formattedJob) {
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
    <JobDetailsErrorBoundary onRetry={handleRetry}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/opportunities/job-seeker" className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Job Listings
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

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Requirements Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h2>
                
                {/* Education */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Education</h3>
                  <div className="space-y-2">
                    {formattedJob.requirements.education.masters && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Masters:</span>
                        <p className="text-gray-600 dark:text-gray-400">{formattedJob.requirements.education.masters}</p>
                      </div>
                    )}
                    {formattedJob.requirements.education.bachelor && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Bachelor/Honors:</span>
                        <p className="text-gray-600 dark:text-gray-400">{formattedJob.requirements.education.bachelor}</p>
                      </div>
                    )}
                    {formattedJob.requirements.education.additionalEducation && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {formattedJob.requirements.education.additionalEducation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                {formattedJob.requirements.experience && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Experience</h3>
                    <p className="text-gray-600 dark:text-gray-400">{formattedJob.requirements.experience}</p>
                  </div>
                )}

                {/* Additional Requirements */}
                {formattedJob.requirements.additionalRequirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Additional Requirements</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {formattedJob.requirements.additionalRequirements}
                    </p>
                  </div>
                )}

                {/* Skills & Expertise */}
                {formattedJob.requirements.skillsExpertise && formattedJob.requirements.skillsExpertise.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {formattedJob.requirements.skillsExpertise.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Procedure */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Apply Procedure</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <RichTextRenderer content={formattedJob.applyProcedure} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Job Summary</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Workplace:</span>
                    <p className="text-gray-700 dark:text-gray-300">{formattedJob.workplace}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Employment Status:</span>
                    <p className="text-gray-700 dark:text-gray-300">{formattedJob.employmentStatus}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Location:</span>
                    <p className="text-gray-700 dark:text-gray-300">{formattedJob.jobLocation}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline:</span>
                    <p className={`font-medium ${formattedJob.isExpired ? 'text-red-600 dark:text-red-400 line-through' : 'text-red-600 dark:text-red-400'}`}>
                      {formattedJob.formattedDeadline}
                      {formattedJob.isExpired && <span className="ml-2 text-xs">(Expired)</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Company Information</h3>
                <div className="space-y-3">
                  {formattedJob.companyInfo.name && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{formattedJob.companyInfo.name}</h4>
                    </div>
                  )}
                  {formattedJob.companyInfo.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {formattedJob.companyInfo.description}
                    </p>
                  )}
                  {formattedJob.companyInfo.address && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Address:</span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{formattedJob.companyInfo.address}</p>
                    </div>
                  )}
                  {formattedJob.companyInfo.website && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Website:</span>
                      <a
                        href={formattedJob.companyInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm block"
                      >
                        {formattedJob.companyInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Button */}
              {!formattedJob.isExpired && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white text-center">
                  <h3 className="text-lg font-semibold mb-2">Ready to Apply?</h3>
                  <p className="text-blue-100 text-sm mb-4">Follow the application procedure above to submit your application.</p>
                  <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    View Application Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </JobDetailsErrorBoundary>
  );
}