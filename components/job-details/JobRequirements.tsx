import React from 'react';
import { FormattedJobOpportunity } from '../../lib/contentful';

interface JobRequirementsProps {
  requirements: FormattedJobOpportunity['requirements'];
}

const JobRequirements = React.memo<JobRequirementsProps>(({ requirements }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h2>
    
    {/* Education */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Education</h3>
      <div className="space-y-2">
        {requirements.education.masters && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Masters:</span>
            <p className="text-gray-600 dark:text-gray-400">{requirements.education.masters}</p>
          </div>
        )}
        {requirements.education.bachelor && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Bachelor/Honors:</span>
            <p className="text-gray-600 dark:text-gray-400">{requirements.education.bachelor}</p>
          </div>
        )}
        {requirements.education.additionalEducation && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {requirements.education.additionalEducation}
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Experience */}
    {requirements.experience && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Experience</h3>
        <p className="text-gray-600 dark:text-gray-400">{requirements.experience}</p>
      </div>
    )}

    {/* Additional Requirements */}
    {requirements.additionalRequirements && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Additional Requirements</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {requirements.additionalRequirements}
        </p>
      </div>
    )}

    {/* Skills & Expertise */}
    {requirements.skillsExpertise && requirements.skillsExpertise.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Skills & Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {requirements.skillsExpertise.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
));

JobRequirements.displayName = 'JobRequirements';
export default JobRequirements;
