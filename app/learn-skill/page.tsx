'use client';

import React from 'react';

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

export default function LearnSkillPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-4xl w-full">
        
        <div className="w-24 h-24 p-6 mx-auto flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 rounded-2xl mb-6 text-purple-500">
            <BookOpenIcon />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent">
          Continue Your Learning Journey
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">
          SkillDash helps you find high-quality courses from leading online learning platforms that align with your discovered skills and career ambitions.
        </p>

        {/* GP Academy Feature Card */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 text-center transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
            {/* Logo Wrapper with white background */}
            <div className="inline-block p-6 bg-white rounded-2xl mx-auto mb-8 shadow-md">
                <img 
                    src="/learn-skill/gp-academy-logo.png" 
                    alt="GP Academy Logo" 
                    className="h-16 sm:h-20"
                />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Top Recommendation</h2>
            <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-400 mb-8">
                Grameenphone Academy offers a wide range of courses focused on future-ready skills, from digital marketing to cybersecurity. It's the perfect place to turn your potential into proficiency.
            </p>
            <a 
                href="https://www.grameenphone.academy/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
                Visit GP Academy
            </a>
        </div>
      </div>
    </div>
  );
}

