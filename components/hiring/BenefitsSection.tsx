import React from 'react';

// Moved to constants for better performance
const BENEFITS = [
  {
    icon: "🎯",
    title: "Quality Candidates",
    description: "Access pre-screened students with verified skills from our platform"
  },
  {
    icon: "⚡",
    title: "Quick Turnaround", 
    description: "Get matched with suitable candidates within 48-72 hours"
  },
  {
    icon: "💰",
    title: "Completely Free",
    description: "100% free service - no charges, no hidden fees, ever"
  },
  {
    icon: "📊",
    title: "Skill Verification",
    description: "Candidates come with AI-verified skills and portfolio samples"
  },
  {
    icon: "🤝",
    title: "Dedicated Support",
    description: "Personal assistance throughout the hiring process"
  },
  {
    icon: "🔄",
    title: "Flexible Terms",
    description: "Part-time, internships, contracts, or full-time positions"
  }
] as const;

const BenefitsSection = React.memo(() => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 px-8 py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Why Choose SkillDash for Hiring?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((benefit, index) => (
            <div key={`${benefit.icon}-${index}`} className="text-center group hover:transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-3xl">{benefit.icon}</span>
              </div>
              <h5 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                {benefit.title}
              </h5>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

BenefitsSection.displayName = 'BenefitsSection';
export default BenefitsSection;
