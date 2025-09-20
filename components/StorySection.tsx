import React from 'react';

const StorySection = () => {
  return (
    <>
      {/* Story Section */}
      <section className="mb-20 md:mb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
            Our Story
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-purple-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* The Problem Card */}
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-8 rounded-3xl shadow-lg border border-red-200/30 dark:border-red-800/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">The Challenge</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We saw talented students struggling to find jobs despite years of study. There was a clear gap between classroom learning and what employers actually wanted. Traditional grades weren't enough.
            </p>
          </div>

          {/* The Solution Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 p-8 rounded-3xl shadow-lg border border-emerald-200/30 dark:border-emerald-800/30 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Solution</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We created SkillDash to show students their hidden strengths, guide their growth with AI, and connect learning directly to real work opportunities. It's gamified, personalized, and built by students for students.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-20 md:mb-32 text-center">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 py-16 px-8 rounded-3xl shadow-xl border border-blue-200/30 dark:border-blue-800/30">
          <div className="mb-8">
            <span className="text-6xl">🚀</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-6">
            Our Mission
          </h2>
          <p className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Close the gap between classroom knowledge and real-world skills. We use AI to create personalized journeys that guide students from discovery to career readiness, connecting them with actual opportunities.
          </p>
        </div>
      </section>

      {/* Competition Section */}
      <section className="text-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 py-16 px-8 rounded-3xl shadow-xl border border-yellow-200/30 dark:border-yellow-800/30">
        <div className="mb-8">
          <span className="text-6xl">🏆</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
          The Spark
        </h2>
        <p className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
          The{' '}
          <a
            href="https://gpfuturemakers.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300 underline decoration-2 underline-offset-4 hover:decoration-wavy transition-all duration-300"
          >
            GP AI Future Maker
          </a>
          {' '}competition gave us the perfect challenge to turn our idea into reality. It inspired us to harness AI to solve real problems and empower the future leaders of Bangladesh.
        </p>
      </section>
    </>
  );
};

export default StorySection;
