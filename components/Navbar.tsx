'use client';

import React from 'react';

// Updated navigation links to match the new homepage sections
const navLinks = [
  { name: 'Skill Quest', href: '/discover' },
  { name: 'Learn Skills', href: 'https://www.grameenphone.academy/', isExternal: true },
  { name: 'Resume Feedback', href: '/resume-feedback' },
  { name: 'Opportunities', href: '/opportunities' },
];

export default function Navbar() {
  // Note: Active link styling is simplified as a workaround for the build environment.
  // The full functionality can be restored once the local environment is fully configured.

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name using the actual image */}
          <a href="/" className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white hover:opacity-80 transition-opacity">
            <div className="relative w-9 h-9">
              <img
                src="/skilldash-logo.png" // Path to your logo in the public folder
                alt="SkillDash Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span>SkillDash</span>
          </a>

          {/* Navigation Links as Buttons */}
          <div className="flex items-center space-x-2">
            {navLinks.map((link) => {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.isExternal ? '_blank' : '_self'}
                  rel={link.isExternal ? 'noopener noreferrer' : ''}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                >
                  {link.name}
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

