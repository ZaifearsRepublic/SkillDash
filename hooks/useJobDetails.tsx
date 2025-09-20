import { useState, useEffect, useCallback, useMemo } from 'react';
import { JobOpportunity, formatJobOpportunity, getJobOpportunityById } from '../lib/contentful';

export const useJobDetails = (jobId: string) => {
  const [job, setJob] = useState<JobOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize formatted job to prevent recalculation
  const formattedJob = useMemo(() => {
    return job ? formatJobOpportunity(job) : null;
  }, [job]);

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      setIsTimeout(false);
      setError(null);

      // Set timeout for loading state
      const timeoutId = setTimeout(() => {
        setIsTimeout(true);
      }, 10000);

      const jobData = await getJobOpportunityById(jobId);
      
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
  }, [jobId]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  return {
    job,
    formattedJob,
    isLoading,
    isTimeout,
    error,
    refetch: fetchJobDetails
  };
};
