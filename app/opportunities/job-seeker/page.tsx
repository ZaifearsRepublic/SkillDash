'use client';
import React from 'react';

export default function JobSeekerPage() {
    const maintenanceUrl = "/opportunities/job-seeker/under-maintenance";

    const features = [
        {
            title: "STAND OUT, BE REMEMBERED",
            description: "Showcase your verified skills from our AI Skill Quest and curated courses. Let your abilities, not just your CV, do the talking and capture the attention of top employers.",
            imageUrl: "/opportunities/job-seeker/remembered.png",
        },
        {
            title: "OWN YOUR CAREER STORY",
            description: "Build a dynamic SkillDash profile that grows with you. Track your progress, add new skills, and present a compelling narrative of your journey from a student to a skilled professional.",
            imageUrl: "/opportunities/job-seeker/career.png",
        },
        {
            title: "PROVE YOUR ABILITIES",
            description: "Go beyond grades. Our platform allows you to apply your skills in real-world freelance gigs and part-time jobs, giving you a portfolio of tangible experience that employers value.",
            imageUrl: "/opportunities/job-seeker/ability.png",
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-800 dark:text-gray-200">
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
                        href={maintenanceUrl}
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
                                    href={maintenanceUrl}
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
    );
}

