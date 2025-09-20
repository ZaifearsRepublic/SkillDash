import React from 'react';
import BookOpenIcon from './BookOpenIcon';

const LearnHeroSection = React.memo(() => {
  return (
    <section className="text-center mb-16 sm:mb-24 relative">
      <div className="hero-fade-in">
        {/* Large Icon */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 p-8 mx-auto flex items-center justify-center bg-purple-100/80 dark:bg-purple-900/50 backdrop-blur-sm rounded-3xl mb-8 text-purple-500 shadow-2xl transform transition-transform duration-300 hover:scale-110">
          <BookOpenIcon />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-600 bg-clip-text text-transparent leading-tight sm:leading-tight md:leading-tight">
          Learn Industry Accredited Courses
        </h1>
        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          SkillDash partners with leading institutions to bring you industry-recognized courses that align with your discovered skills and career ambitions.
        </p>
        
        <div className="flex flex-row items-baseline justify-center gap-x-2 sm:gap-x-3 text-xl sm:text-2xl font-semibold mb-10">
          <span className="text-gray-700 dark:text-gray-300">
            Turn your potential into
          </span>
          <span className="bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">
            Proficiency
          </span>
        </div>
      </div>
    </section>
  );
});

LearnHeroSection.displayName = 'LearnHeroSection';
export default LearnHeroSection;
