import React from 'react';

const FEATURES = [
  {
    icon: "📝",
    title: "Self-Service Job Posting",
    description: "Easy online form to post jobs instantly",
    bgColor: "bg-blue-100 dark:bg-blue-900/50"
  },
  {
    icon: "👥",
    title: "Talent Pool Access",
    description: "Browse and search our verified candidate database",
    bgColor: "bg-green-100 dark:bg-green-900/50"
  },
  {
    icon: "⚡",
    title: "AI Matching Engine",
    description: "Smart recommendations based on job requirements",
    bgColor: "bg-purple-100 dark:bg-purple-900/50"
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    description: "Track application rates and candidate engagement",
    bgColor: "bg-orange-100 dark:bg-orange-900/50"
  },
  {
    icon: "💬",
    title: "Direct Messaging",
    description: "Communicate with candidates through our platform",
    bgColor: "bg-pink-100 dark:bg-pink-900/50"
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description: "Get alerted when ideal candidates apply",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50"
  }
] as const;

const ComingSoonFeatures = React.memo(() => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50 px-8 py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Exciting Features in Development
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            We're building powerful tools to make hiring even easier
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <div key={`${feature.icon}-${index}`} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <span className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
            🚀 Coming Q1 2026
          </span>
        </div>
      </div>
    </div>
  );
});

ComingSoonFeatures.displayName = 'ComingSoonFeatures';
export default ComingSoonFeatures;
