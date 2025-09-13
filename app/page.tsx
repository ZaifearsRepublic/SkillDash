'use client';

import React from 'react';
import TypingAnimation from '@/components/TypingAnimation';

// --- Helper Icon Components ---
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
    </svg>
);
const ChartLineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-4 0v-3H2v3h2z"/>
    </svg>
);
const CogsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c-1.79-.527-1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.115 2.692l.319.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.319c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764-.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg>
);

export default function SkillDashHome() {

  const coreFeatures = [
    {
      icon: "/homepage/discover-talent.png",
      title: "Discover Your Talent",
      description: "Start your journey with our AI Skill Quest to uncover your unique strengths and passions.",
      href: "/discover",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: "/homepage/new-skills.png",
      title: "Learn New Skills",
      description: "Access curated courses to build job-ready skills and turn your potential into proficiency.",
      href: "https://www.grameenphone.academy/",
      isExternal: true,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: "/homepage/resume-feedback.png",
      title: "AI Resume Feedback",
      description: "Get instant, expert feedback from our AI to craft a resume that stands out to employers.",
      href: "/resume-feedback",
      gradient: "from-sky-500 to-cyan-600",
    },
    {
      icon: "/homepage/opportunites-logo.png",
      title: "Find Opportunities",
      description: "Unlock a curated portal of part-time jobs and freelance gigs to gain real-world experience.",
      href: "/opportunities",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-24 sm:py-32">

        {/* --- Hero Section --- */}
        <section className="text-center mb-24 sm:mb-32">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Bridge the Skill Gap
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
            From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
          </p>

          {/* Typing Text Animation */}
          <div className="flex flex-row items-baseline justify-center gap-x-2 sm:gap-x-3 text-2xl sm:text-3xl font-semibold mb-10">
            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Unlock your
            </span>
            <TypingAnimation />
          </div>
        </section>

        {/* --- Core Features Section --- */}
        <section className="mb-24 sm:mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature) => (
              <a
                key={feature.title}
                href={feature.href}
                target={feature.isExternal ? '_blank' : '_self'}
                rel={feature.isExternal ? 'noopener noreferrer' : ''}
                className={`group relative p-6 flex flex-col items-center text-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div className="relative h-16 w-16 mb-4">
                  <img
                    src={feature.icon}
                    alt={`${feature.title} logo`}
                    width="64"
                    height="64"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 z-10">{feature.title}</h3>
                <p className="text-sm opacity-90 z-10">{feature.description}</p>
                {/* Subtle decorative element */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
              </a>
            ))}
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="relative text-center py-20 sm:py-24 px-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl overflow-hidden">
          {/* Background geometric shapes */}
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Your Journey to a Dream Career Starts Here
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-16">
              SkillDash is more than a learning platform; it’s a complete ecosystem designed to guide you from self-discovery to employment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center">
                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 text-xl text-blue-500 w-12 h-12 flex items-center justify-center">
                  <UsersIcon />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Personalized Growth</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI understands your unique talents and recommends tailored learning paths to maximize your potential.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 text-xl text-purple-500 w-12 h-12 flex items-center justify-center">
                  <ChartLineIcon />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Real-World Application</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Apply your new skills through part-time jobs and freelance projects, building a portfolio that impresses employers.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-4 text-xl text-emerald-500 w-12 h-12 flex items-center justify-center">
                  <CogsIcon />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">AI-Powered Tools</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  From resume feedback to skill tracking, our intelligent tools give you a competitive edge in the job market.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Competition Footer Section --- */}
        <footer className="text-center mt-24 sm:mt-32">
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A project for the{' '}
              <a
                href="https://gpfuturemakers.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                GP AI Future Maker
              </a>
              {' '}competition, designed to mitigate the skill gap for Bangladesh's future leaders.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}

