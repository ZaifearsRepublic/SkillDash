import React from 'react';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 11v6m-3-3h6" />
    </svg>
);

export default function OpportunitiesPage() {
  const jobSeekerMaintenanceUrl = "/opportunities/job-seeker/under-maintenance";
  const hirerMaintenanceUrl = "/opportunities/hiring/under-maintenance";

  const features = [
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
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-800 dark:text-gray-200">
      {/* Top Section - Path Selection */}
      <div className="bg-white dark:bg-black flex flex-col items-center justify-center text-center p-4 py-16">
        <div className="max-w-4xl w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Unlock Your Next Opportunity
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">
            Are you looking for your next role, or searching for the perfect candidate? Select your path below to get started.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* I am seeking a job card */}
            <a
              href={jobSeekerMaintenanceUrl}
              className="group relative flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className="mb-4">
                <img 
                  src="/opportunities/seeking-jobs.png" 
                  alt="Seeking Jobs" 
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold mb-2">I am seeking a job</h2>
              <p className="text-white/80">Find part-time roles, internships, and freelance gigs tailored to your skills.</p>
              {/* Light mode animation */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 dark:hidden" />
              {/* Dark mode animation - subtle glow effect */}
              <div className="hidden dark:block absolute -bottom-4 -right-4 w-16 h-16 bg-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            </a>

            {/* I am hiring card */}
            <a
              href={hirerMaintenanceUrl}
              className="group relative flex flex-col items-center justify-center p-12 bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-800 hover:border-blue-500"
            >
              <div className="mb-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">
                <img 
                  src="/opportunities/hiring.png" 
                  alt="Hiring" 
                  className="h-12 w-12 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <h2 className="text-3xl font-bold mb-2">I am hiring</h2>
              <p className="text-gray-600 dark:text-gray-400">Post a job opening and find skilled, ambitious student talent for your team.</p>
            </a>
          </div>
        </div>
      </div>

      {/* Job Seeker Section */}
      <div className="bg-white dark:bg-black text-gray-800 dark:text-gray-200">
        {/* Hero Section */}
        <header className="py-24 sm:py-32 text-center bg-gray-50 dark:bg-gray-900/50 px-4">
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
              Create Your Profile
            </a>
          </div>
        </header>

        {/* Features Section */}
        <main className="py-20 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            {features.map((feature, index) => (
              <section key={feature.title} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className={`text-center md:text-left ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{feature.description}</p>
                  <a
                    href={jobSeekerMaintenanceUrl}
                    className="inline-block text-lg font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                  >
                    Sign up now &rarr;
                  </a>
                </div>
                <div className={`flex justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <img 
                    src={feature.imageUrl} 
                    alt={feature.title} 
                    className="rounded-lg shadow-2xl object-cover w-full max-w-md h-auto"
                  />
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}