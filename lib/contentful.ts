import { createClient, Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

// Debug environment variables (remove this after fixing)
console.log('Environment check:', {
  spaceId: process.env.CONTENTFUL_SPACE_ID ? 'Found' : 'Missing',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN ? 'Found' : 'Missing',
});

// Validate environment variables
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!spaceId) {
  throw new Error('CONTENTFUL_SPACE_ID environment variable is required');
}

if (!accessToken) {
  throw new Error('CONTENTFUL_ACCESS_TOKEN environment variable is required');
}

const client = createClient({
  space: spaceId,
  accessToken: accessToken,
});

// Define the entry skeleton type for Contentful
interface JobOpportunitySkeleton extends EntrySkeletonType {
  contentTypeId: 'jobOpportunity';
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

// ✅ Use the Entry type directly instead of extending it
export type JobOpportunity = Entry<JobOpportunitySkeleton, undefined, string>;

// ✅ Create a separate interface for the processed/formatted data
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

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
  try {
    const entries = await client.getEntries<JobOpportunitySkeleton>({
      content_type: 'jobOpportunity',
      order: ['-sys.createdAt'],
    });
    
    return entries.items;
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    return [];
  }
}

export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  try {
    const entry = await client.getEntry<JobOpportunitySkeleton>(id);
    return entry;
  } catch (error) {
    console.error('Error fetching job opportunity:', error);
    return null;
  }
}

// ✅ Helper function to safely access fields from Contentful entry
function getJobField<T>(job: JobOpportunity, fieldName: string): T {
  return (job.fields as any)[fieldName] as T;
}

// ✅ Helper function to format dates
export function formatDeadline(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }); // Returns format like "27/09/2025"
  } catch (error) {
    return dateString; // Fallback to original string if parsing fails
  }
}

// Helper function to check if deadline has passed
export function isDeadlinePassed(dateString: string): boolean {
  try {
    const deadline = new Date(dateString);
    const now = new Date();
    return deadline < now;
  } catch (error) {
    return false;
  }
}

// ✅ Helper function to convert Contentful entry to formatted data
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
