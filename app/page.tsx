"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { FaPlay, FaSearch, FaGamepad, FaChartLine, FaBriefcase, FaRobot, FaFileAlt } from 'react-icons/fa';

export default function SkillDashHome() {
  // Using an animated blob effect for a modern, dynamic feel
  const blobPath = useMemo(() =>
    "M0.764,0.887 C0.711,0.992,0.57,1,0.5,1 C0.43,1,0.289,0.992,0.236,0.887 C0.158,0.729,0.01,0.627,0.001,0.5 C0.01,0.373,0.158,0.271,0.236,0.113 C0.289,0.008,0.43,0,0.5,0 C0.57,0,0.711,0.008,0.764,0.113 C0.842,0.271,0.99,0.373,0.999,0.5 C0.99,0.627,0.842,0.729,0.764,0.887"
  , []);

  const howItWorksSteps = [
    { icon: <FaSearch />, title: "AI Skill Quest", description: "Our smart AI quiz discovers your hidden talents and interests in minutes." },
    { icon: <FaGamepad />, title: "Learn & Grow", description: "Level up with personalized Skill Courses and AI-powered learning paths." },
    { icon: <FaRobot />, title: "AI Resume Feedback", description: "Get instant, AI-driven feedback to make your resume stand out to employers." },
    { icon: <FaBriefcase />, title: "Get Hired", description: "Unlock a curated board for part-time jobs and freelance gigs." },
  ];
  
  const keyFeatures = [
    { icon: <FaGamepad />, name: "Gamified Skill Quests" },
    { icon: <FaRobot />, name: "AI-Powered Coach" },
    { icon: <FaFileAlt />, name: "Smart Resume Builder" },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes spin-gradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .outline-container::before {
          content: '';
          position: absolute;
          inset: -3px;
          background: conic-gradient(from 180deg at 50% 50%, #4f46e5, #101010, #101010, #4f46e5);
        }
        .dark .outline-container::before {
            background: conic-gradient(from 180deg at 50% 50%, #6366f1, #fafafa, #fafafa, #6366f1);
        }
        .outline-container::before {
            clip-path: url(#blob-shape);
            animation: spin-gradient 6s linear infinite;
            z-index: -1;
            will-change: transform;
        }
        .outline-container {
          contain: layout style paint;
        }
        @keyframes scroll-words-step {
          0%, 14% { transform: translateY(0); }
          16%, 30% { transform: translateY(-16.66%); }
          32%, 46% { transform: translateY(-33.33%); }
          48%, 62% { transform: translateY(-50%); }
          64%, 78% { transform: translateY(-66.66%); }
          80%, 100% { transform: translateY(-83.33%); }
        }
        .animate-scroll-words-step {
          animation: scroll-words-step 12s ease-in-out infinite;
        }
        .scrolling-text-mask {
          -webkit-mask-image: linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%);
          mask-image: linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%);
        }
      `}</style>

      <div className="min-h-screen w-full">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-24">

          {/* --- Hero Section --- */}
          <section className="text-center mb-24 sm:mb-32">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6">
              <svg width="0" height="0" aria-hidden="true">
                <defs><clipPath id="blob-shape" clipPathUnits="objectBoundingBox"><path d={blobPath} /></clipPath></defs>
              </svg>
              <div className="outline-container relative w-full h-full">
                <div className="absolute inset-0 bg-gray-800 dark:bg-white" style={{ clipPath: 'url(#blob-shape)' }}>
                   <Image
                      src="/skilldash-logo.png"
                      alt="SkillDash Logo"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover p-4"
                      style={{ clipPath: 'url(#blob-shape)' }}
                      priority
                    />
                </div>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold font-mono tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              SkillDash
            </h1>
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8">
              The AI-Powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-semibold mb-10">
                <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">Unlock your</span>
                <div className="relative h-12 sm:h-14 w-64 overflow-hidden scrolling-text-mask text-left">
                    <div className="animate-scroll-words-step">
                        <div className="h-12 sm:h-14 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Creativity</div>
                        <div className="h-12 sm:h-14 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Problem-Solving</div>
                        <div className="h-12 sm:h-14 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Digital Literacy</div>
                        <div className="h-12 sm:h-14 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Leadership</div>
                        <div className="h-12 sm:h-14 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Coding Skills</div>
                        <div className="h-12 sm:h-14 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Creativity</div>
                    </div>
                </div>
            </div>

            <Link href="/discover" className="group inline-block">
              <button
                  type="button"
                  className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none active:scale-100 active:shadow group-hover:shadow-purple-500/30"
              >
                  <FaPlay className="text-xl group-hover:animate-pulse" />
                  <span className="tracking-wide">Start Your AI Skill Quest</span>
              </button>
            </Link>
          </section>
          
          {/* --- How It Works Section --- */}
          <section className="mb-24 sm:mb-32">
             <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Your AI-Powered Journey to Employability</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {howItWorksSteps.map(step => (
                    <div key={step.title} className="group bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:bg-white dark:hover:bg-gray-900 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-200 dark:group-hover:bg-gray-700/50 transition-colors duration-300 text-blue-500 dark:text-blue-400 text-3xl">
                           {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                    </div>
                ))}
             </div>
          </section>
          
          {/* --- Key Features Section --- */}
          <section className="text-center">
             <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Core Features Powered by AI</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
               {keyFeatures.map(feature => (
                 <div key={feature.name} className="flex flex-col items-center gap-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-transparent hover:ring-2 hover:ring-blue-500">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-500 dark:text-blue-400 text-3xl flex-shrink-0">
                        {feature.icon}
                    </div>
                    <span className="font-semibold text-xl text-center">{feature.name}</span>
                 </div>
               ))}
            </div>
          </section>

          {/* --- Footer Note --- */}
          <footer className="text-center mt-24 sm:mt-32">
            <div className="bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A project for the Grameenphone Futuremakers Competition, designed to mitigate the skill gap for Bangladesh's future leaders.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

