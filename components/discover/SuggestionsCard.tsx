import React, { useState, useCallback } from 'react';
import SkillBadges from './SkillBadges';

interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  nextStep: 'resume' | 'jobs';
}

interface SuggestionsCardProps {
  data: SkillSuggestions;
}

// Optimized: Memoized icons to prevent re-renders
const ChevronIcon = React.memo<{ isExpanded: boolean }>(({ isExpanded }) => (
  <svg 
    className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
));
ChevronIcon.displayName = 'ChevronIcon';

const SuggestionsCard = React.memo<SuggestionsCardProps>(({ data }) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topSkills: true,
    skillsToDevelop: false,
    courses: false,
    nextSteps: false
  });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleJsonView = useCallback(() => {
    setShowRawJson(prev => !prev);
  }, []);

  if (showRawJson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6 suggestions-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Raw JSON Data</h3>
          <button 
            onClick={toggleJsonView}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Show Cards
          </button>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-800 dark:text-gray-200 max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 suggestions-fade-in">
      {/* Header with JSON Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Skill Quest Complete! 🎉
          </h2>
          <button 
            onClick={toggleJsonView}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            View JSON
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Top Skills Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('topSkills')}
          className="w-full px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">🌟 Your Top Skills</h3>
          <ChevronIcon isExpanded={expandedSections.topSkills} />
        </button>
        {expandedSections.topSkills && (
          <div className="p-6">
            <SkillBadges 
              skills={data.topSkills} 
              colorClass="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200" 
            />
          </div>
        )}
      </div>

      {/* Skills to Develop Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('skillsToDevelop')}
          className="w-full px-6 py-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 flex items-center justify-between hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">🎯 Skills to Develop</h3>
          <ChevronIcon isExpanded={expandedSections.skillsToDevelop} />
        </button>
        {expandedSections.skillsToDevelop && (
          <div className="p-6">
            <SkillBadges 
              skills={data.skillsToDevelop} 
              colorClass="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200" 
            />
          </div>
        )}
      </div>

      {/* Suggested Courses Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('courses')}
          className="w-full px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">📚 Recommended Courses</h3>
          <ChevronIcon isExpanded={expandedSections.courses} />
        </button>
        {expandedSections.courses && (
          <div className="p-6 space-y-4">
            {data.suggestedCourses.map((course, index) => (
              <div key={`${course.title}-${index}`} className="border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">{course.title}</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{course.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Steps Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('nextSteps')}
          className="w-full px-6 py-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">🚀 Your Next Steps</h3>
          <ChevronIcon isExpanded={expandedSections.nextSteps} />
        </button>
        {expandedSections.nextSteps && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a 
                href="/learn-skill" 
                className="text-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
              >
                <div className="text-2xl mb-2">📖</div>
                <div>Learn Skills</div>
              </a>
              
              {data.nextStep === 'resume' ? (
                <a 
                  href="/resume-feedback" 
                  className="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
                >
                  <div className="text-2xl mb-2">📄</div>
                  <div>AI Resume Feedback</div>
                </a>
              ) : (
                <a 
                  href="/opportunities" 
                  className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div>Explore Jobs & Gigs</div>
                </a>
              )}

              <a 
                href="/opportunities" 
                className="text-center bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div>Find Opportunities</div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SuggestionsCard.displayName = 'SuggestionsCard';
export default SuggestionsCard;
