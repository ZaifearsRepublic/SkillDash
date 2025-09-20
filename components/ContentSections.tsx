import React from 'react';
import Link from 'next/link';
import { FaUser, FaBriefcase, FaCogs } from 'react-icons/fa';

const ContentSections = () => {
  return (
    <>
      {/* Learn New Skills Section */}
      <section className="relative py-20 bg-gradient-to-r from-slate-800 to-slate-900">
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

      {/* AI Resume Feedback Section */}
      <section className="relative py-20 bg-gradient-to-l from-slate-800 to-slate-900">
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

      {/* Find Opportunities Section */}
      <section className="relative py-20 bg-gradient-to-r from-slate-900 to-emerald-900/20">
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

      {/* How It Works Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="text-6xl mb-6">🚀</div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Your Journey to a Dream Career Starts Here
          </h2>
          
          <p className="text-xl text-slate-300 mb-16 max-w-4xl mx-auto">
            SkillDash is more than a learning platform; it's a complete ecosystem designed to guide you from self-discovery to employment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-blue-400 mb-4 flex justify-center">
                <FaUser className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-4">
                Personalized Growth
              </h3>
              
              <p className="text-slate-300 leading-relaxed">
                Our AI understands your unique talents and recommends tailored learning paths to maximize your potential.
              </p>
            </div>

            <div className="p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-blue-400 mb-4 flex justify-center">
                <FaBriefcase className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-4">
                Real-World Application
              </h3>
              
              <p className="text-slate-300 leading-relaxed">
                Apply your new skills through part-time jobs and freelance projects, building a portfolio that impresses employers.
              </p>
            </div>

            <div className="p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-blue-400 mb-4 flex justify-center">
                <FaCogs className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-4">
                AI-Powered Tools
              </h3>
              
              <p className="text-slate-300 leading-relaxed">
                From resume feedback to skill tracking, our intelligent tools give you a competitive edge in the job market.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContentSections;
