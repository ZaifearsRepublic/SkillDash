import React from 'react';
import Image from 'next/image';

interface Feature {
  title: string;
  description: string;
  imageUrl: string;
}

const FEATURES: Feature[] = [
  {
    title: "STAND OUT, BE REMEMBERED",
    description: "Showcase your verified skills from our AI Skill Quest and curated courses. Let your abilities, not just your CV, do the talking and capture the attention of top employers.",
    imageUrl: "/opportunities/remembered.png",
  },
  {
    title: "OWN YOUR CAREER STORY",
    description: "Build a dynamic SkillDash profile that grows with you. Track your progress, add new skills, and present a compelling narrative of your journey from a student to a skilled professional.",
    imageUrl: "/opportunities/career.png",
  },
  {
    title: "PROVE YOUR ABILITIES",
    description: "Go beyond grades. Our platform allows you to apply your skills in real-world freelance gigs and part-time jobs, giving you a portfolio of tangible experience that employers value.",
    imageUrl: "/opportunities/ability.png",
  },
] as const;

const FeatureSection = React.memo<{ feature: Feature; index: number; maintenanceUrl: string }>(({ feature, index, maintenanceUrl }) => {
  const isReversed = index % 2 === 1;
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className={`text-center md:text-left ${isReversed ? 'md:order-2' : ''}`}>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          {feature.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {feature.description}
        </p>
        <a
          href={maintenanceUrl}
          className="inline-block text-lg font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
        >
          Explore Job Listings &rarr;
        </a>
      </div>
      
      {/* REDESIGNED: Flexible image container that adapts to image aspect ratio */}
      <div className={`flex justify-center ${isReversed ? 'md:order-1' : ''}`}>
        <div className="relative w-full max-w-md group">
          {/* Responsive container that maintains image aspect ratio */}
          <div className="relative w-full h-auto">
            <Image 
              src={feature.imageUrl}
              alt={feature.title}
              width={400}
              height={300}
              sizes="(max-width: 768px) 100vw, 400px"
              className="rounded-lg shadow-2xl object-contain w-full h-auto transform transition-all duration-300 group-hover:scale-105"
            />
          </div>
          
          {/* Optional: Decorative border */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 pointer-events-none" />
        </div>
      </div>
    </section>
  );
});

FeatureSection.displayName = 'FeatureSection';

const JobSeekerSection = React.memo(() => {
  const jobSeekerMaintenanceUrl = "/opportunities/job-seeker";

  return (
    <div className="text-gray-800 dark:text-gray-200">
      <header className="py-24 sm:py-32 text-center bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Your Skills, Your Future, Your Way
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join SkillDash to discover your talents, prove your abilities, and connect with opportunities that launch your career.
          </p>
          <a
            href={jobSeekerMaintenanceUrl}
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 px-10 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Look into Opportunities
          </a>
        </div>
      </header>

      <main className="py-20 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-20">
          {FEATURES.map((feature, index) => (
            <FeatureSection
              key={feature.title}
              feature={feature}
              index={index}
              maintenanceUrl={jobSeekerMaintenanceUrl}
            />
          ))}
        </div>
      </main>
    </div>
  );
});

JobSeekerSection.displayName = 'JobSeekerSection';
export default JobSeekerSection;
