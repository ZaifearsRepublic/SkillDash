'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// Memoized icons to prevent re-renders
const MailIcon = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
  </svg>
));
MailIcon.displayName = 'MailIcon';

const CheckIcon = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
));
CheckIcon.displayName = 'CheckIcon';

const ArrowRightIcon = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
));
ArrowRightIcon.displayName = 'ArrowRightIcon';

// Enhanced Contact Form Component
const ContactForm: React.FC = React.memo(() => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Pre-filled email template
  const emailTemplate = useMemo(() => {
    const subject = encodeURIComponent("Job Posting Request - SkillDash");
    const body = encodeURIComponent(`Hi SkillDash Team,

I would like to post a job opportunity on your platform.

Job Details:
• Position: [Enter position name]
• Company: [Enter company name]
• Location: [Enter location]
• Employment Type: [Full-time/Part-time/Contract/Internship]
• Experience Level: [Entry/Mid/Senior level]
• Requirements: [Enter key requirements]
• Budget/Salary Range: [Optional]

Additional Information:
• Job Description: [Brief description]
• Application Deadline: [Date]
• Contact Person: [Name and title]

Please let me know the next steps for posting this opportunity.

Thank you!`);
    
    return `mailto:alshahoriar.hossain@gmail.com?subject=${subject}&body=${body}`;
  }, []);

  const handleEmailClick = () => {
    setIsSubmitting(true);
    // Simulate processing
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  return (
    <div className="px-8 py-12 text-center">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Find Top Talent?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
          Connect with skilled students and recent graduates. Send us your job requirements and we'll help you find the perfect candidates from our talented community.
        </p>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-center text-green-800 dark:text-green-200">
              <CheckIcon />
              <span className="ml-2 font-medium">Email client opened! We'll get back to you soon.</span>
            </div>
          </div>
        )}

        {/* Main CTA Button */}
        <a
          href={emailTemplate}
          onClick={handleEmailClick}
          className="group relative inline-flex items-center justify-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-bold py-6 px-12 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg mb-6 disabled:opacity-50"
          style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
          
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              <span className="relative z-10">Opening Email...</span>
            </>
          ) : (
            <>
              <MailIcon />
              <span className="ml-3 relative z-10">Post Your Job Opportunity</span>
              <ArrowRightIcon />
            </>
          )}
        </a>


      </div>
    </div>
  );
});
ContactForm.displayName = 'ContactForm';

// Benefits Section Component
const BenefitsSection: React.FC = React.memo(() => {
  const benefits = useMemo(() => [
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
  ], []);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 px-8 py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Why Choose SkillDash for Hiring?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-200">
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

// Coming Soon Features Component
const ComingSoonFeatures: React.FC = React.memo(() => {
  const features = useMemo(() => [
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
  ], []);

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
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
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
        
        {/* Coming Soon Badge */}
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

export default function HiringPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/opportunities" className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-lg">Back to Opportunities</span>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Hire Top <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Student Talent</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Connect with skilled, motivated students and recent graduates. Find your next intern, part-time employee, or entry-level hire from our verified talent pool.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <ContactForm />
          <BenefitsSection />
          <ComingSoonFeatures />
        </div>
      </div>
    </div>
  );
}