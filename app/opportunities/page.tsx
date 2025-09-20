'use client';

import React from 'react';
import Link from 'next/link';

// NOTE: The useAuth and useRouter hooks have been removed.

export default function OpportunitiesPage() {
  // ✅ FIXED - URLs remain the same
  const jobSeekerMaintenanceUrl = "/opportunities/job-seeker";
  const hirerMaintenanceUrl = "/opportunities/hiring";

  const features = [
    {
      title: "STAND OUT, BE REMEMBERED",
      description: "Showcase your verified skills from our AI Skill Quest and curated courses. Let your abilities, not just your CV, do the talking and capture the attention of top employers.",
      imageUrl: "/opportunities/remembered.png",
    },
    {
      title: "OWN YOUR CAREER STORY",
      description: "Build a dynamic SkillDash profile that grows with you. Track your progress, add new skills, and present a compelling narrative of your journey from a student to a skilled professional.",
      imageUrl: "/opportunities/career.png",
    },
    {
      title: "PROVE YOUR ABILITIES",
      description: "Go beyond grades. Our platform allows you to apply your skills in real-world freelance gigs and part-time jobs, giving you a portfolio of tangible experience that employers value.",
      imageUrl: "/opportunities/ability.png",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
      </div>

      <div className="min-h-screen text-gray-800 dark:text-gray-200 relative z-10">
        {/* Top Section - Path Selection */}
        <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 py-16">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Unlock Your Next Opportunity
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">
              Are you looking for your next role, or searching for the perfect candidate? Select your path below to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* I am seeking a job card */}
              <a
                href={jobSeekerMaintenanceUrl}
                className="group relative flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="mb-4">
                  <img 
                    src="/opportunities/seeking-jobs.png" 
                    alt="Seeking Jobs" 
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-2">I am seeking a job</h2>
                <p className="text-white/80">Find part-time roles, internships, and freelance gigs tailored to your skills.</p>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 dark:hidden" />
                <div className="hidden dark:block absolute -bottom-4 -right-4 w-16 h-16 bg-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </a>

              {/* I am hiring card */}
              <a
                href={hirerMaintenanceUrl}
                className="group relative flex flex-col items-center justify-center p-12 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm text-gray-800 dark:text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-800 hover:border-blue-500"
              >
                <div className="mb-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">
                  <img 
                    src="/opportunities/hiring.png" 
                    alt="Hiring" 
                    className="h-12 w-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-2">I am hiring</h2>
                <p className="text-gray-600 dark:text-gray-400">Post a job opening and find skilled, ambitious student talent for your team.</p>
              </a>
            </div>
          </div>
        </div>

        {/* Job Seeker Section */}
        <div className="text-gray-800 dark:text-gray-200">
          <header className="py-24 sm:py-32 text-center bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                Your Skills, Your Future, Your Way
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">
                Join SkillDash to discover your talents, prove your abilities, and connect with opportunities that launch your career.
              </p>
              <a
                href={jobSeekerMaintenanceUrl}
                className="inline-block bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 px-10 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                Create Your Profile
              </a>
            </div>
          </header>

          <main className="py-20 sm:py-24 px-4">
            <div className="max-w-6xl mx-auto space-y-20">
              {features.map((feature, index) => (
                <section key={feature.title} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className={`text-center md:text-left ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{feature.description}</p>
                    <a
                      href={jobSeekerMaintenanceUrl}
                      className="inline-block text-lg font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                    >
                      Sign up now &rarr;
                    </a>
                  </div>
                  <div className={`flex justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <img 
                      src={feature.imageUrl} 
                      alt={feature.title} 
                      className="rounded-lg shadow-2xl object-cover w-full max-w-md h-auto"
                    />
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200/50 dark:border-gray-800/50 pt-10 mt-16 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-t-3xl mx-4">
          <div className="max-w-5xl mx-auto px-4 pb-6 flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-between">
            <div className="flex flex-col gap-3 min-w-[150px]">
              <div className="relative">
                <img src="/skilldash-logo.png" alt="SkillDash Logo" width="56" height="56" className="mb-2 transform hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SkillDash</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                Built for the <a href="https://gpfuturemakers.com/" className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">GP AI Future Maker</a> competition.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-1">
              <div>
                <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">About</h4>
                <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
                  <li><a href="/about-us" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">About Us</a></li>
                  <li><a href="https://gpfuturemakers.com/" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">GP AI Future Maker</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Useful Links</h4>
                <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
                  <li><a href="/discover" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Discover</a></li>
                  <li><a href="/resume-feedback" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">AI Resume Feedback</a></li>
                  <li><a href="/opportunities" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Find Opportunities</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Contact</h4>
                <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
                  <li>
                    <a href="mailto:alshahoriar.hossain@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300">
                      MD AL SHAHORIAR HOSSAIN
                    </a>
                  </li>
                  <li>
                    <a href="mailto:tasnuvajahanlamiya@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300">
                      TASNUVA JAHAN LAMIYA
                    </a>
                  </li>
                  <li>
                    <a href="mailto:tazrianrahman28@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300">
                      TAZRIAN RAHMAN GUNJON
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="text-center my-4 py-4 border-t border-gray-200/30 dark:border-gray-700/30">
            <span className="text-xs text-gray-400 dark:text-gray-600">
              &copy; {new Date().getFullYear()} SkillDash. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}