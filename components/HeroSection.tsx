import React from 'react';
import Link from 'next/link';
import TypingAnimation from './TypingAnimation';

const HeroSection = () => {
  return (
    <section className="relative z-10 container mx-auto px-6 pt-32 pb-20 text-center">
      <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6">
        Bridge the Skill Gap
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
        From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
      </p>

      <div className="relative inline-block mb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75" />
        <Link
          href="/discover"
          className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300 inline-flex items-center gap-3"
        >
          Discover your talent with SkillDash AI
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <div>
        <span className="text-slate-400 text-lg">Unlock your </span>
        <TypingAnimation />
      </div>
    </section>
  );
};

export default HeroSection;
