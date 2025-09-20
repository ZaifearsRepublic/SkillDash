import React from 'react';
import Link from 'next/link';
import TypingAnimation from './TypingAnimation';

const TypingHeroSection = () => {
  return (
    <section className="relative z-10 container mx-auto px-6 pt-20 pb-16 text-center">
      {/* Main Title - Reduced top padding */}
      <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight py-2">
        Bridge the Skill Gap
      </h1>
      
      {/* Description - Reduced bottom margin */}
      <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
        From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
      </p>

      {/* CTA Button - Reduced bottom margin */}
      <div className="relative inline-block mb-12">
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

      {/* BALANCED: Medium-sized typing animation that fits on screen */}
      <div className="relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl rounded-2xl" />
        
        {/* Compact but prominent container */}
        <div className="relative bg-slate-800/20 backdrop-blur-sm rounded-2xl py-8 px-6 border border-slate-700/30">
          <div className="flex items-center justify-center gap-4">
            {/* Left side text */}
            <span className="text-xl md:text-3xl text-slate-300 font-light">
              Unlock your
            </span>
            
            {/* Right side - Medium-sized typing animation */}
            <div className="text-xl md:text-3xl lg:text-4xl font-bold">
              <TypingAnimation />
            </div>
          </div>
          
          {/* Small subtitle */}
          <p className="text-sm md:text-base text-slate-400 mt-4 max-w-md mx-auto">
            Let AI discover your hidden potential
          </p>
        </div>
      </div>
    </section>
  );
};

export default TypingHeroSection;
