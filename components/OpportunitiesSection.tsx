import React from 'react';
import Link from 'next/link';

const OpportunitiesSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-r from-slate-900 to-emerald-900/20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-16 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Find Real-World Opportunities
        </h2>
        
        <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto">
          Connect your skills directly to the job market. SkillDash unlocks a curated portal of part-time jobs and freelance gigs from trusted companies. Gain valuable hands-on experience and start earning while you're still in university.
        </p>

        <Link
          href="/opportunities"
          className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300"
        >
          Browse Gigs & Jobs
        </Link>
      </div>
    </section>
  );
};

export default OpportunitiesSection;
