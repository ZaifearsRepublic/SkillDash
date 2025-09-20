import React from 'react';
import { FaUser, FaBriefcase, FaCogs } from 'react-icons/fa';

const HowItWorksSection = () => {
  const features = [
    {
      icon: <FaUser className="w-8 h-8" />,
      title: "Personalized Growth",
      description: "Our AI understands your unique talents and recommends tailored learning paths to maximize your potential."
    },
    {
      icon: <FaBriefcase className="w-8 h-8" />,
      title: "Real-World Application", 
      description: "Apply your new skills through part-time jobs and freelance projects, building a portfolio that impresses employers."
    },
    {
      icon: <FaCogs className="w-8 h-8" />,
      title: "AI-Powered Tools",
      description: "From resume feedback to skill tracking, our intelligent tools give you a competitive edge in the job market."
    }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Background decorations */}
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
          {features.map((feature, index) => (
            <div key={feature.title} className="p-8 bg-slate-800/50 rounded-xl backdrop-blur-sm">
              <div className="text-blue-400 mb-4 flex justify-center">
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              
              <p className="text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
