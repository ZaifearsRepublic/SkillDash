"use client";

// A simple SVG for the logo
const SkillDashLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M12 5.25v-1.5m0 15v1.5m3.75-18v1.5m-7.5 0v1.5m7.5 15v-1.5m-7.5 0v-1.5m15-7.5H3.75c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5Z" />
    </svg>
);


export default function Navbar() {
    const navLinks = [
        { name: 'Skill Quest', href: '/discover' },
        { name: 'Resume Feedback', href: '/resume' },
        { name: 'Opportunities', href: '/jobs' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/80">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side: Logo and Name */}
                    <div className="flex items-center">
                        <a href="/" className="flex items-center space-x-2">
                            <SkillDashLogo />
                            <span className="text-xl font-bold text-gray-800 tracking-tight">SkillDash</span>
                        </a>
                    </div>

                    {/* Right Side: Navigation Links */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-6">
                        {navLinks.map((link) => (
                            <a 
                                key={link.name} 
                                href={link.href}
                                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>
        </header>
    );
}

