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
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-center p-4">
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
            href="/opportunities/job-seeker"
            className="group relative flex flex-col items-center justify-center p-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="mb-4">
              <SearchIcon />
            </div>
            <h2 className="text-3xl font-bold mb-2">I am seeking a job</h2>
            <p className="text-white/80">Find part-time roles, internships, and freelance gigs tailored to your skills.</p>
             <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          </a>

          {/* I am hiring card */}
          <a
            href="/opportunities/hiring"
            className="group relative flex flex-col items-center justify-center p-12 bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-800 hover:border-blue-500"
          >
            <div className="mb-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">
              <UserPlusIcon />
            </div>
            <h2 className="text-3xl font-bold mb-2">I am hiring</h2>
            <p className="text-gray-600 dark:text-gray-400">Post a job opening and find skilled, ambitious student talent for your team.</p>
          </a>
        </div>
      </div>
    </div>
  );
}

