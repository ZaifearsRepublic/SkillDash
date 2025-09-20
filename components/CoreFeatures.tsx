import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CoreFeatures = () => {
  const coreFeatures = [
    {
      icon: "/homepage/discover-talent.png",
      title: "Discover Your Talent",
      description: "Start with our AI Skill Quest to uncover your unique strengths and passions.",
      href: "/discover",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: "/homepage/new-skills.png",
      title: "Learn New Skills",
      description: "Access curated courses to build job-ready skills and turn potential into proficiency.",
      href: "/learn-skill",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: "/homepage/resume-feedback.png",
      title: "AI Resume Feedback",
      description: "Get instant AI feedback to craft a resume that stands out to employers.",
      href: "/resume-feedback",
      gradient: "from-sky-500 to-cyan-600",
    },
    {
      icon: "/homepage/opportunites-logo.png",
      title: "Find Opportunities",
      description: "Unlock a portal of part-time jobs and freelance gigs to gain real experience.",
      href: "/opportunities",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <section className="relative z-10 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
          Your Path to Success
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {coreFeatures.map((feature, index) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`group relative p-6 flex flex-col items-center text-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="relative w-16 h-16 mb-4">
                <Image
                  src={feature.icon}
                  alt={`${feature.title} logo`}
                  fill
                  sizes="64px"
                  className="object-contain filter drop-shadow-lg"
                />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-sm opacity-90 leading-relaxed">{feature.description}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
