'use client';
import React, { useState, useEffect } from 'react';

// --- Typing Animation Component ---
const TypingAnimation = () => {
    const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const typingSpeed = isDeleting ? 50 : 100;
    const skills = [
        "Digital Marketing", "Graphic Design", "WebDev", "Content Creation", "Public Speaking",
        "Data Analysis", "Project Management", "UI/UX Design", "Financial Models", "Creative Writing",
        "Video Editing", "Ethical Hacking", "SEO", "Critical Thinking", "Leadership",
        "AI Prompting", "App Development", "Cloud Computing", "E-commerce", "Cybersecurity"
    ];
    useEffect(() => {
        const handleTyping = () => {
            const fullText = skills[currentSkillIndex];
            if (isDeleting) {
                setDisplayedText(fullText.substring(0, displayedText.length - 1));
            } else {
                setDisplayedText(fullText.substring(0, displayedText.length + 1));
            }
            if (!isDeleting && displayedText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && displayedText === '') {
                setIsDeleting(false);
                setCurrentSkillIndex((prev) => (prev + 1) % skills.length);
            }
        };
        const timeout = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, currentSkillIndex, skills]);
    return (
        <span className="inline-block whitespace-nowrap bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent min-h-[48px] sm:min-h-[56px]">
            {displayedText}
            <span className="opacity-75 animate-pulse">|</span>
        </span>
    );
};

// --- Helper Icon Components ---
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
    </svg>
);

const ChartLineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2zm1 12h2V2h-2v12zm-3 0V7H7v7h2zm-4 0v-3H2v3h2z"/>
    </svg>
);

const CogsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c-1.79-.527-1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.115 2.692l.319.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.319c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764-.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg>
);

export default function SkillDashHome() {
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
        <div className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
            {/* Simplified animated background elements - only 4 circles */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                {/* Circle 1 - Top left, bouncing */}
                <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
                
                {/* Circle 2 - Top right, pulsing */}
                <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                
                {/* Circle 3 - Center, bouncing */}
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                
                {/* Circle 4 - Bottom right, bouncing */}
                <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14 relative z-10">
                {/* --- Hero Section --- */}
                <section className="text-center mb-24 sm:mb-32 relative">
                    <div className="animate-fade-in-up">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent leading-tight sm:leading-tight md:leading-tight animate-gradient">
                            Bridge the Skill Gap
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
                        </p>
                        
                        {/* Discover Button with enhanced styling */}
                        <div className="my-10">
                            <a href="/discover" className="group relative inline-flex flex-col items-center bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 hover:from-blue-700 hover:via-purple-600 hover:to-indigo-700 text-white py-3 px-10 sm:py-4 sm:px-16 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none active:scale-100 overflow-hidden">
                                {/* Button glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                                <span className="text-lg sm:text-2xl font-bold tracking-wide relative z-10">Discover your talent</span>
                                <span className="text-xs sm:text-sm opacity-80 font-normal tracking-wide relative z-10">with SkillDash AI</span>
                            </a>
                        </div>
                        
                        <div className="flex flex-row items-baseline justify-center gap-x-2 sm:gap-x-3 text-2xl sm:text-3xl font-semibold mb-10">
                            <span className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                Unlock your
                            </span>
                            <TypingAnimation />
                        </div>
                    </div>
                </section>

                {/* --- Core Features Section --- */}
                <section className="mb-24 sm:mb-32 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-4">
                            Your Path to Success
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {coreFeatures.map((feature, index) => (
                            <a
                                key={feature.title}
                                href={feature.href}
                                className={`group relative p-6 flex flex-col items-center text-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-fade-in-up`}
                                style={{animationDelay: `${0.2 + index * 0.1}s`}}
                            >
                                {/* Floating decoration with enhanced animation */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500"></div>
                                
                                <div className="relative h-16 w-16 mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <img
                                        src={feature.icon}
                                        alt={`${feature.title} logo`}
                                        className="w-full h-full object-contain filter drop-shadow-lg"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-2 z-10 group-hover:text-white/90 transition-colors duration-300">{feature.title}</h3>
                                <p className="text-sm opacity-90 z-10 group-hover:opacity-100 transition-opacity duration-300">{feature.description}</p>
                                
                                {/* Enhanced bottom decoration */}
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 group-hover:opacity-70 transition-all duration-500" />
                                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/5 rounded-full opacity-30 group-hover:scale-125 transition-all duration-300" />
                            </a>
                        ))}
                    </div>
                </section>
            </div>

            {/* --- Enhanced Learn New Skills Section --- */}
            <section className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-purple-500 to-violet-600 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-5 w-12 h-12 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
                
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="flex justify-center">
                        <div className="relative">
                            <img src="/homepage/new-skills.png" alt="Learn New Skills" className="rounded-lg transform hover:scale-105 transition-transform duration-500 shadow-2xl"/>
                            <div className="absolute -inset-4 bg-white/20 rounded-lg blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Learn In-Demand Skills</h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed">
                            Once you've discovered your strengths, SkillDash guides you to curated learning paths. Access top-tier courses from partners like Grameenphone Academy to build job-ready skills and turn your potential into certified proficiency.
                        </p>
                        <a href="/learn-skill" className="inline-block bg-white text-purple-700 font-bold py-3 px-8 rounded-lg hover:bg-purple-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Explore Courses
                        </a>
                    </div>
                </div>
            </section>

            {/* --- Enhanced AI Resume Feedback Section --- */}
            <section className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-sky-500 to-cyan-600 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-20 left-20 w-18 h-18 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute top-1/2 right-5 w-14 h-14 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
                
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="text-center md:text-left order-2 md:order-1">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Perfect Your Resume with AI</h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed">
                            Stop guessing what recruiters want. Upload your resume and get instant, intelligent feedback from our AI Coach. Receive actionable tips to highlight your new skills, optimize for job descriptions, and create a resume that truly stands out.
                        </p>
                        <a href="/resume-feedback" className="inline-block bg-white text-sky-700 font-bold py-3 px-8 rounded-lg hover:bg-sky-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Get AI Feedback
                        </a>
                    </div>
                    <div className="flex justify-center order-1 md:order-2">
                        <div className="relative">
                            <img src="/homepage/resume-feedback.png" alt="AI Resume Feedback" className="rounded-lg transform hover:scale-105 transition-transform duration-500 shadow-2xl"/>
                            <div className="absolute -inset-4 bg-white/20 rounded-lg blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Enhanced Find Opportunities Section --- */}
            <section className="min-h-screen flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-16 left-16 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/3 left-8 w-12 h-12 bg-white/5 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="flex justify-center">
                        <div className="relative">
                            <img src="/homepage/opportunites-logo.png" alt="Find Opportunities" className="rounded-lg transform hover:scale-105 transition-transform duration-500 shadow-2xl"/>
                            <div className="absolute -inset-4 bg-white/20 rounded-lg blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Find Real-World Opportunities</h2>
                        <p className="text-lg text-white/90 mb-8 leading-relaxed">
                            Connect your skills directly to the job market. SkillDash unlocks a curated portal of part-time jobs and freelance gigs from trusted companies. Gain valuable hands-on experience and start earning while you're still in university.
                        </p>
                        <a href="/opportunities" className="inline-block bg-white text-emerald-700 font-bold py-3 px-8 rounded-lg hover:bg-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Browse Gigs & Jobs
                        </a>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* --- Enhanced How It Works Section --- */}
                <section className="relative text-center py-20 sm:py-24 px-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden my-24">
                    {/* Enhanced background decorations */}
                    <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="relative z-10">
                        <div className="mb-8">
                            <span className="text-6xl animate-bounce inline-block">🚀</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent mb-6">
                            Your Journey to a Dream Career Starts Here
                        </h2>
                        <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-16 leading-relaxed">
                            SkillDash is more than a learning platform; it's a complete ecosystem designed to guide you from self-discovery to employment.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center group transform hover:scale-105 transition-all duration-300">
                                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg mb-4 text-white w-16 h-16 flex items-center justify-center group-hover:shadow-2xl transition-shadow duration-300">
                                    <UsersIcon />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Personalized Growth</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Our AI understands your unique talents and recommends tailored learning paths to maximize your potential.
                                </p>
                            </div>
                            <div className="flex flex-col items-center group transform hover:scale-105 transition-all duration-300">
                                <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg mb-4 text-white w-16 h-16 flex items-center justify-center group-hover:shadow-2xl transition-shadow duration-300">
                                    <ChartLineIcon />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Real-World Application</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Apply your new skills through part-time jobs and freelance projects, building a portfolio that impresses employers.
                                </p>
                            </div>
                            <div className="flex flex-col items-center group transform hover:scale-105 transition-all duration-300">
                                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg mb-4 text-white w-16 h-16 flex items-center justify-center group-hover:shadow-2xl transition-shadow duration-300">
                                    <CogsIcon />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">AI-Powered Tools</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    From resume feedback to skill tracking, our intelligent tools give you a competitive edge in the job market.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Enhanced Footer Section --- */}
                <footer className="border-t border-gray-200/50 dark:border-gray-800/50 pt-10 mt-16 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-t-3xl">
                    <div className="max-w-5xl mx-auto px-4 pb-6 flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-between">
                        {/* Logo and About */}
                        <div className="flex flex-col gap-3 min-w-[150px]">
                            <div className="relative">
                                <img src="/skilldash-logo.png" alt="SkillDash Logo" width="56" height="56" className="mb-2 transform hover:scale-110 transition-transform duration-300" />
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SkillDash</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                                Built for the <a href="https://gpfuturemakers.com/" className="underline font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">GP AI Future Maker</a> competition.
                            </p>
                        </div>
                        
                        {/* Footer Links */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-1">
                            <div>
                                <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">About</h4>
                                <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                    <li><a href="/about-us" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">About Us</a></li>
                                    <li><a href="https://gpfuturemakers.com/" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300" target="_blank" rel="noopener noreferrer">GP AI Future Maker</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Useful Links</h4>
                                <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                    <li><a href="/discover" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Discover</a></li>
                                    <li><a href="/resume-feedback" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">AI Resume Feedback</a></li>
                                    <li><a href="/opportunities" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Find Opportunities</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Contact</h4>
                                <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                    <li>
                                        <a href="mailto:alshahoriar.hossain@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300">
                                            MD AL SHAHORIAR HOSSAIN
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:tasnuvajahanlamiya@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300">
                                            TASNUVA JAHAN LAMIYA
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:tazrianrahman28@gmail.com" className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors duration-300">
                                            TAZRIAN RAHMAN GUNJON
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="text-center my-4 py-4 border-t border-gray-200/30 dark:border-gray-700/30">
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                            &copy; {new Date().getFullYear()} SkillDash. All rights reserved.
                        </span>
                    </div>
                </footer>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes gradient {
                    0%, 100% {
                        background-size: 200% 200%;
                        background-position: left center;
                    }
                    50% {
                        background-size: 200% 200%;
                        background-position: right center;
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                    opacity: 0;
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}
