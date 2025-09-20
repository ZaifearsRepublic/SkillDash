import React from 'react';
import Link from 'next/link';

const ResumeSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-l from-slate-800 to-slate-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Perfect Your Resume with AI
        </h2>
        
        <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto">
          Stop guessing what recruiters want. Upload your resume and get instant, intelligent feedback from our AI Coach. Receive actionable tips to highlight your new skills, optimize for job descriptions, and create a resume that truly stands out.
        </p>

        <Link
          href="/resume-feedback"
          className="inline-block bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300"
        >
          Get AI Feedback
        </Link>
      </div>
    </section>
  );
};

export default ResumeSection;
