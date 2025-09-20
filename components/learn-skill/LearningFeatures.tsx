import React from 'react';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Personalized Learning Paths',
    description: 'Courses tailored based on your AI Skill Quest results and career goals',
    bgColor: 'bg-blue-100/80 dark:bg-blue-900/50'
  },
  {
    icon: '🏆',
    title: 'Industry Recognition',
    description: 'Certificates and credentials recognized by leading employers',
    bgColor: 'bg-green-100/80 dark:bg-green-900/50'
  },
  {
    icon: '⚡',
    title: 'Future-Ready Skills',
    description: 'AI, Data Science, Digital Marketing, Cybersecurity and more',
    bgColor: 'bg-purple-100/80 dark:bg-purple-900/50'
  }
] as const;

const LearningFeatures = React.memo(() => {
  return (
    <section className="mb-24 features-fade-in">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-4">
          Why Choose Our Learning Partners
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto rounded-full" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {FEATURES.map((feature, index) => (
          <div 
            key={feature.title}
            className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl p-8 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-center"
          >
            <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">{feature.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
});

LearningFeatures.displayName = 'LearningFeatures';

// CRITICAL: Make sure this is a default export
export default LearningFeatures;
