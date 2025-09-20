'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

// Loading component
const AuthLoadingScreen = () => (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
);

export default function LearnSkillPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to access learning resources. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/learn-skill');
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      {/* Animated background elements - same as homepage */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Circle 1 - Top left, bouncing */}
        <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        
        {/* Circle 2 - Top right, pulsing */}
        <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Circle 3 - Center, bouncing */}
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        
        {/* Circle 4 - Bottom right, bouncing */}
        <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-16 sm:mb-24 relative">
          <div className="animate-fade-in-up">
            {/* Large Icon */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 p-8 mx-auto flex items-center justify-center bg-purple-100/80 dark:bg-purple-900/50 backdrop-blur-sm rounded-3xl mb-8 text-purple-500 shadow-2xl transform transition-transform duration-300 hover:scale-110">
                <BookOpenIcon />
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 bg-clip-text text-transparent leading-tight sm:leading-tight md:leading-tight animate-gradient">
              Learn Industry Accredited Courses
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              SkillDash partners with leading institutions to bring you industry-recognized courses that align with your discovered skills and career ambitions.
            </p>
            
            <div className="flex flex-row items-baseline justify-center gap-x-2 sm:gap-x-3 text-xl sm:text-2xl font-semibold mb-10">
              <span className="text-gray-700 dark:text-gray-300">
                Turn your potential into
              </span>
              <span className="bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">
                Proficiency
              </span>
            </div>
          </div>
        </section>

        {/* GP Academy Feature Card */}
        <section className="mb-16 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-8 sm:p-12 text-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl">
                {/* Logo Wrapper with enhanced styling */}
                <div className="inline-block p-6 bg-white/90 backdrop-blur-sm rounded-2xl mx-auto mb-8 shadow-lg transform transition-transform duration-300 hover:scale-105">
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
                    className="group relative inline-block bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
                    <span className="relative z-10 text-lg">Visit GP Academy</span>
                </a>
            </div>
          </div>
        </section>

        {/* Learning Features Section */}
        <section className="mb-24 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-4">
              Why Choose Our Learning Partners
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl p-8 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100/80 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Personalized Learning Paths</h3>
              <p className="text-gray-600 dark:text-gray-400">Courses tailored based on your AI Skill Quest results and career goals</p>
            </div>

            <div className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl p-8 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100/80 dark:bg-green-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Industry Recognition</h3>
              <p className="text-gray-600 dark:text-gray-400">Certificates and credentials recognized by leading employers</p>
            </div>

            <div className="group bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl p-8 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100/80 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Future-Ready Skills</h3>
              <p className="text-gray-600 dark:text-gray-400">AI, Data Science, Digital Marketing, Cybersecurity and more</p>
            </div>
          </div>
        </section>

        {/* Footer with homepage style */}
        <footer className="border-t border-gray-200/50 dark:border-gray-800/50 pt-10 mt-16 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-t-3xl">
          <div className="max-w-5xl mx-auto px-4 pb-6 flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-between">
            {/* Logo and About */}
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
            
            {/* Footer Links */}
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

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
