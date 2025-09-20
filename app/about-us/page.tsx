'use client';

import React from 'react';

// Data for the team members
const teamMembers = [
  {
    name: "MD AL Shahoriar Hossain",
    role: "Finance & Data Analytics Lead",
    imageUrl: "/about-us/shahoriar.png",
    description:
      "A Finance major with a passion for data-driven decision-making. Shahoriar's expertise in financial analysis, Excel, and Power BI drives the analytical core of SkillDash, ensuring our skill assessments and learning paths are backed by solid data.",
    contactUrl: "http://shahoriar.me/contact",
  },
  {
    name: "Tasnuva Jahan Lamiya",
    role: "Education & User Experience Lead",
    imageUrl: "/about-us/tasnuva.png",
    description:
      "With a passion for making learning accessible and enjoyable, Tasnuva's experience in online tutoring and instruction shapes the user-centric design of our Skill Courses. Her innovative mindset helps bridge the gap between academic knowledge and practical application.",
    contactUrl: "https://www.linkedin.com/in/tasnuva-jahan-lamiya/",
  },
  {
    name: "Tazrian Rahman",
    role: "Strategy & Community Lead",
    imageUrl: "/about-us/tazrian.png",
    description:
      "Tazrian brings extensive leadership and communication experience from his diverse roles in university clubs and internships. His skills in team management and public relations are vital for building the SkillDash community and forging connections with real-world opportunities.",
    contactUrl: "https://www.linkedin.com/in/tazrian-rahman-aa6822247/",
  },
];

export default function AboutUsPage() {
    const cardGradients = [
        "from-blue-500/10 via-purple-500/5 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/10 dark:to-indigo-500/20",
        "from-pink-500/10 via-rose-500/5 to-purple-500/10 dark:from-pink-500/20 dark:via-rose-500/10 dark:to-purple-500/20",
        "from-violet-500/10 via-sky-500/5 to-cyan-500/10 dark:from-violet-500/20 dark:via-sky-500/10 dark:to-cyan-500/20"
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 text-gray-800 dark:text-gray-200 py-12 sm:py-24 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 dark:bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-purple-400/10 dark:bg-purple-400/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/10 dark:bg-pink-400/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 bg-indigo-400/10 dark:bg-indigo-400/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-20 md:mb-28">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              About SkillDash
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              We are passionate students building a bridge between education and employment in Bangladesh.
            </p>
          </div>
        </section>

        {/* Meet the Team Header */}
        <section className="text-center mb-16 md:mb-20">
          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
              Meet the Team
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
        </section>

        {/* Team Members Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20 md:mb-32">
          {teamMembers.map((member, idx) => (
            <div
              key={member.name}
              className={`group relative flex flex-col items-center text-center p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200/30 dark:border-gray-700/50 backdrop-blur-sm bg-gradient-to-br ${
                cardGradients[idx % 3]
              } animate-fade-in-up`}
              style={{animationDelay: `${0.3 + idx * 0.1}s`}}
            >
              {/* Floating decoration */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative w-36 h-36 mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white/50 dark:border-gray-700/50 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <img
                  src={member.imageUrl}
                  alt={`Profile picture of ${member.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {member.name}
              </h2>
              
              <h3 className="text-sm font-semibold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent uppercase tracking-wide">
                {member.role}
              </h3>
              
              <p className="text-gray-700 dark:text-gray-300 mb-8 flex-grow leading-relaxed text-sm">
                {member.description}
              </p>
              
              <a
                href={member.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 hover:from-blue-700 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
              >
                Get in Touch
              </a>
            </div>
          ))}
        </section>

        {/* Story Section - Redesigned with cards */}
        <section className="mb-20 md:mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
              Our Story
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* The Problem Card */}
            <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-8 rounded-3xl shadow-lg border border-red-200/30 dark:border-red-800/30 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">The Challenge</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We saw talented students struggling to find jobs despite years of study. There was a clear gap between classroom learning and what employers actually wanted. Traditional grades weren't enough.
              </p>
            </div>

            {/* The Solution Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 p-8 rounded-3xl shadow-lg border border-emerald-200/30 dark:border-emerald-800/30 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Solution</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We created SkillDash to show students their hidden strengths, guide their growth with AI, and connect learning directly to real work opportunities. It's gamified, personalized, and built by students for students.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-20 md:mb-32 text-center">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 py-16 px-8 rounded-3xl shadow-xl border border-blue-200/30 dark:border-blue-800/30">
            <div className="mb-8">
              <span className="text-6xl">🚀</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Our Mission
            </h2>
            <p className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Close the gap between classroom knowledge and real-world skills. We use AI to create personalized journeys that guide students from discovery to career readiness, connecting them with actual opportunities.
            </p>
          </div>
        </section>

        {/* Competition Section */}
        <section className="text-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 py-16 px-8 rounded-3xl shadow-xl border border-yellow-200/30 dark:border-yellow-800/30">
          <div className="mb-8">
            <span className="text-6xl">🏆</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
            The Spark
          </h2>
          <p className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            The{' '}
            <a
              href="https://gpfuturemakers.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 underline decoration-2 underline-offset-4 hover:decoration-wavy transition-all duration-300"
            >
              GP AI Future Maker
            </a>
            {' '}competition gave us the perfect challenge to turn our idea into reality. It inspired us to harness AI to solve real problems and empower the future leaders of Bangladesh.
          </p>
        </section>
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