import { createClient, Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

// ✅ Environment variables with fallbacks (for Next.js 15 compatibility)
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'qz001ds11gs3';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || '9Xkr6hXeKKPMfTCIngLAG7k0n-g4JsIqJ2xeJGcUSb0';

// ✅ Create client with optimized settings
const client = createClient({
  space: spaceId,
  environment: 'master',
  accessToken: accessToken,
  // Add timeout and retry settings for better performance
  timeout: 10000, // 10 seconds timeout
  retryLimit: 3,
});

// ✅ In-memory cache with TTL
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// ✅ Interface with correct content type ID
interface JobOpportunitySkeleton extends EntrySkeletonType {
  contentTypeId: 'SkillDashJobs';
  fields: {
    positionName: EntryFieldTypes.Text;
    company: EntryFieldTypes.Text;
    location: EntryFieldTypes.Text;
    educationalRequirement: EntryFieldTypes.Text;
    deadlineToApply: EntryFieldTypes.Date;
    requirements: EntryFieldTypes.Object;
    workplace: EntryFieldTypes.Text;
    employmentStatus: EntryFieldTypes.Text;
    jobLocation: EntryFieldTypes.Text;
    applyProcedure: EntryFieldTypes.RichText;
    companyInfo: EntryFieldTypes.Object;
  };
}

// ✅ Use the Entry type directly
export type JobOpportunity = Entry<JobOpportunitySkeleton, undefined, string>;

// ✅ Formatted job interface
export interface FormattedJobOpportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  positionName: string;
  company: string;
  location: string;
  educationalRequirement: string;
  deadlineToApply: string;
  formattedDeadline: string;
  isExpired: boolean;
  requirements: {
    education: {
      masters: string;
      bachelor: string;
      additionalEducation: string;
    };
    experience: string;
    additionalRequirements: string;
    skillsExpertise: string[];
  };
  workplace: string;
  employmentStatus: string;
  jobLocation: string;
  applyProcedure: any;
  companyInfo: {
    name: string;
    address: string;
    website: string;
    description: string;
  };
}

// ✅ Optimized function with caching and pagination
export async function getJobOpportunities(limit = 100): Promise<JobOpportunity[]> {
  const cacheKey = `jobs_${limit}`;
  
  // Check cache first
  const cachedData = cache.get<JobOpportunity[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Use Promise.race for timeout handling
    const fetchPromise = client.getEntries<JobOpportunitySkeleton>({
      content_type: 'SkillDashJobs',
      order: ['-sys.createdAt'],
      limit
      // Note: Removed select parameter due to TypeScript compatibility issues
      // The performance benefits from caching and timeouts are more important
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 8000)
    );

    const entries = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Cache the result
    cache.set(cacheKey, entries.items);
    
    return entries.items;
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    
    // Return empty array but don't cache failures
    return [];
  }
}

// ✅ Optimized single job fetch with caching
export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  const cacheKey = `job_${id}`;
  
  // Check cache first
  const cachedData = cache.get<JobOpportunity>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const fetchPromise = client.getEntry<JobOpportunitySkeleton>(id);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 8000)
    );

    const entry = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Cache with shorter TTL for individual entries (2 minutes)
    cache.set(cacheKey, entry, 2 * 60 * 1000);
    
    return entry;
  } catch (error) {
    console.error('Error fetching job opportunity:', error);
    return null;
  }
}

// ✅ Helper function to safely access fields
function getJobField<T>(job: JobOpportunity, fieldName: string): T {
  return (job.fields as any)[fieldName] as T;
}

// ✅ Memoized date formatting
const dateFormatCache = new Map<string, string>();

export function formatDeadline(dateString: string): string {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }

  try {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    
    dateFormatCache.set(dateString, formatted);
    return formatted;
  } catch (error) {
    dateFormatCache.set(dateString, dateString);
    return dateString;
  }
}

// ✅ Memoized deadline checking
const deadlineCache = new Map<string, boolean>();

export function isDeadlinePassed(dateString: string): boolean {
  const cacheKey = `${dateString}_${new Date().toDateString()}`;
  
  if (deadlineCache.has(cacheKey)) {
    return deadlineCache.get(cacheKey)!;
  }

  try {
    const deadline = new Date(dateString);
    const now = new Date();
    const isPassed = deadline < now;
    
    deadlineCache.set(cacheKey, isPassed);
    return isPassed;
  } catch (error) {
    deadlineCache.set(cacheKey, false);
    return false;
  }
}

// ✅ Optimized formatting with minimal processing for list views
export function formatJobOpportunityMinimal(job: JobOpportunity): Partial<FormattedJobOpportunity> {
  const deadlineString = getJobField<string>(job, 'deadlineToApply');
  
  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: getJobField<string>(job, 'positionName'),
    company: getJobField<string>(job, 'company'),
    location: getJobField<string>(job, 'location'),
    educationalRequirement: getJobField<string>(job, 'educationalRequirement'),
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: isDeadlinePassed(deadlineString),
    workplace: getJobField<string>(job, 'workplace'),
    employmentStatus: getJobField<string>(job, 'employmentStatus'),
    jobLocation: getJobField<string>(job, 'jobLocation'),
  };
}

// ✅ Full formatting for detail views only
export function formatJobOpportunity(job: JobOpportunity): FormattedJobOpportunity {
  const deadlineString = getJobField<string>(job, 'deadlineToApply');
  const requirements = getJobField<any>(job, 'requirements') || {};
  const companyInfo = getJobField<any>(job, 'companyInfo') || {};
  
  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: getJobField<string>(job, 'positionName'),
    company: getJobField<string>(job, 'company'),
    location: getJobField<string>(job, 'location'),
    educationalRequirement: getJobField<string>(job, 'educationalRequirement'),
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: isDeadlinePassed(deadlineString),
    requirements: {
      education: {
        masters: requirements.education?.masters || '',
        bachelor: requirements.education?.bachelor || '',
        additionalEducation: requirements.education?.additionalEducation || '',
      },
      experience: requirements.experience || '',
      additionalRequirements: requirements.additionalRequirements || '',
      skillsExpertise: requirements.skillsExpertise || [],
    },
    workplace: getJobField<string>(job, 'workplace'),
    employmentStatus: getJobField<string>(job, 'employmentStatus'),
    jobLocation: getJobField<string>(job, 'jobLocation'),
    applyProcedure: getJobField<any>(job, 'applyProcedure'),
    companyInfo: {
      name: companyInfo.name || '',
      address: companyInfo.address || '',
      website: companyInfo.website || '',
      description: companyInfo.description || '',
    },
  };
}

// ✅ Utility function to clear cache (useful for development)
export function clearCache(): void {
  cache.clear();
  dateFormatCache.clear();
  deadlineCache.clear();
}