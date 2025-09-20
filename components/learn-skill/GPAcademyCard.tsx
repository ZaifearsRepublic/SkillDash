import React from 'react';
import Image from 'next/image';

const GPAcademyCard = React.memo(() => {
  return (
    <section className="mb-16 academy-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200/50 dark:border-gray-800/50 rounded-3xl p-8 sm:p-12 text-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl">
          {/* ALTERNATIVE: More flexible container */}
          <div className="inline-block px-8 py-4 bg-white/90 backdrop-blur-sm rounded-2xl mx-auto mb-8 shadow-lg transform transition-transform duration-300 hover:scale-105">
            <div className="relative w-60 h-20 sm:w-72 sm:h-24"> {/* Even wider if needed */}
              <Image
                src="/learn-skill/gp-academy-logo.png"
                alt="GP Academy Logo"
                fill
                sizes="(max-width: 640px) 240px, 288px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Top Recommendation</h2>
          <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-400 mb-8">
            Grameenphone Academy offers a wide range of courses focused on future-ready skills, from digital marketing to cybersecurity. It's the perfect place to turn your potential into proficiency.
          </p>
          <a 
            href="https://www.grameenphone.academy/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group relative inline-block bg-gradient-to-r from-purple-600 to-violet-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl" />
            <span className="relative z-10 text-lg">Visit GP Academy</span>
          </a>
        </div>
      </div>
    </section>
  );
});

GPAcademyCard.displayName = 'GPAcademyCard';
export default GPAcademyCard;
