import React from 'react';
import { FormattedJobOpportunity } from '../../lib/contentful';

interface JobSidebarProps {
  formattedJob: FormattedJobOpportunity;
}

const JobSidebar = React.memo<JobSidebarProps>(({ formattedJob }) => (
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
));

JobSidebar.displayName = 'JobSidebar';
export default JobSidebar;
