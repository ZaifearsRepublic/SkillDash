import React from 'react';
import Link from 'next/link';

const SkillsSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-r from-slate-800 to-slate-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Learn In-Demand Skills
        </h2>
        
        <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto">
          Once you've discovered your strengths, SkillDash guides you to curated learning paths. Access top-tier courses from partners like Grameenphone Academy to build job-ready skills and turn your potential into certified proficiency.
        </p>

        <Link
          href="/learn-skill"
          className="inline-block bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300"
        >
          Explore Courses
        </Link>
      </div>
    </section>
  );
};

export default SkillsSection;
