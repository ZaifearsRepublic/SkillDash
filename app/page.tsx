"use client";

import Link from 'next/link';
import React from 'react';

// --- SVG Icons (replaces react-icons dependency) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const FileSignatureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// Array for the main feature cards using the new SVG icons
const featureCards = [
  {
    href: '/discover',
    icon: <SearchIcon />,
    title: 'Discover Your Talent',
    description: 'Start your journey with our AI Skill Quest to uncover your unique strengths and passions.',
    bgColor: 'from-blue-500 to-blue-600',
  },
  {
    href: 'https://www.grameenphone.academy/',
    icon: <LightbulbIcon />,
    title: 'Learn New Skills',
    description: 'Access curated courses to build job-ready skills and turn your potential into proficiency.',
    bgColor: 'from-purple-500 to-purple-600',
    isExternal: true,
  },
  {
    href: '/resume-feedback',
    icon: <FileSignatureIcon />,
    title: 'AI Resume Feedback',
    description: 'Get instant, expert feedback from our AI to craft a resume that stands out to employers.',
    bgColor: 'from-green-500 to-green-600',
  },
  {
    href: '/opportunities',
    icon: <BriefcaseIcon />,
    title: 'Find Opportunities',
    description: 'Unlock a curated portal of part-time jobs and freelance gigs to gain real-world experience.',
    bgColor: 'from-yellow-500 to-yellow-600',
  },
];

export default function SkillDashHome() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-black text-gray-800 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 text-center">
        
        {/* --- Hero Section --- */}
        <section className="mb-20">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Unlock Your Future
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            The all-in-one platform for Bangladeshi students to discover talents, learn skills, and launch careers.
          </p>
        </section>

        {/* --- Main Feature Cards Section --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {featureCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              target={card.isExternal ? '_blank' : '_self'}
              rel={card.isExternal ? 'noopener noreferrer' : ''}
              className={`group relative p-8 flex flex-col items-center justify-center text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden bg-gradient-to-br ${card.bgColor}`}
            >
              <div className="w-12 h-12 text-5xl mb-4 transition-transform duration-300 group-hover:scale-110">{card.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
              <p className="text-sm font-light opacity-90">{card.description}</p>
              <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-10 group-hover:bg-opacity-0 transition-all duration-300"></div>
            </Link>
          ))}
        </section>

        {/* --- How It Helps Section --- */}
        <section className="max-w-4xl mx-auto">
           <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How SkillDash Empowers You</h2>
           <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-left space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              In today's competitive job market, a degree isn't enough. SkillDash bridges the gap between your academic knowledge and the practical skills employers demand. We've created a fun, engaging ecosystem to help you build confidence and showcase your abilities.
            </p>
            <p>
              Our AI-powered tools provide personalized guidance, from identifying your natural talents to perfecting your resume. We connect you with real opportunities, allowing you to gain experience and start your career journey even before you graduate.
            </p>
            <p className="font-semibold text-blue-500 dark:text-blue-400">
              Join SkillDash and transform from a student into a sought-after professional.
            </p>
           </div>
        </section>

      </div>
    </div>
  );
}

