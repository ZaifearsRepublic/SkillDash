import { useState, useEffect, useCallback } from 'react';
import { JobOpportunity, getJobOpportunities } from '../lib/contentful';

export const useJobData = () => {
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsTimeout(false);
      setError(null);

      // Set timeout for loading state
      const timeoutId = setTimeout(() => {
        setIsTimeout(true);
      }, 10000); // Show timeout message after 10 seconds

      const jobData = await getJobOpportunities(50); // Limit to 50 jobs initially
      
      clearTimeout(timeoutId);
      setJobs(jobData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load job opportunities. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTimeout(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    isTimeout,
    error,
    refetch: fetchJobs
  };
};
