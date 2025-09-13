'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define the navigation links in an array for easier mapping
const navLinks = [
  { name: 'Skill Quest', href: '/discover' },
  { name: 'Resume Feedback', href: '/resume' },
  { name: 'Opportunities', href: '/jobs' },
];

// A simple inline SVG to replace the react-icons dependency
const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M15.59 13.41l-2.18-2.18 2.18-2.18a.996.996 0 10-1.41-1.41l-2.18 2.18-2.18-2.18a.996.996 0 10-1.41 1.41l2.18 2.18-2.18 2.18a.996.996 0 101.41 1.41l2.18-2.18 2.18 2.18a.996.996 0 101.41-1.41zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);


export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name */}
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 flex items-center justify-center bg-blue-500 rounded-lg text-white">
              <LogoIcon />
            </div>
            <span>SkillDash</span>
          </Link>

          {/* Navigation Links as Buttons */}
          <div className="flex items-center space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

