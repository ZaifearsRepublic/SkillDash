'use client';

import React, { useState, useEffect } from 'react';
import AuthStatus from '@/components/AuthStatus';

export default function Navbar() {
  const [pathname, setPathname] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Set the initial pathname on the client side
    setPathname(window.location.pathname);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scrolling when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Discover', href: '/discover', icon: '/homepage/ai-icon.png' },
    { name: 'Learn Skills', href: '/learn-skill' },
    { name: 'AI Resume Feedback', href: '/resume-feedback', icon: '/homepage/ai-icon.png' },
    { name: 'Opportunities', href: '/opportunities' },
    { name: 'About Us', href: '/about-us' },
  ];

  const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  );
  
  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20"> {/* Increased height */}
          {/* Logo and Site Name */}
          <a href="/" className="flex items-center gap-3 text-2xl font-bold text-gray-800 dark:text-white"> {/* Increased size and gap */}
            <img
              src="/skilldash-logo.png"
              alt="SkillDash Logo"
              width="40"
              height="40"
              className="h-10 w-10" // Increased size
            />
            <span>SkillDash</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-3"> {/* Increased gap */}
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors ${ // Increased padding and font size
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.icon && <img src={link.icon} alt="" className="w-5 h-5 mr-2" />} {/* Increased icon size */}
                  {link.name}
                </a>
              );
            })}
             <AuthStatus />
          </nav>
          
          {/* Hamburger Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <AuthStatus />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden absolute top-20 left-0 w-full h-screen bg-white dark:bg-black 
          transition-all duration-300 ease-in-out transform
          ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <nav className="flex flex-col p-4 gap-4"> {/* Increased gap */}
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-center px-4 py-4 text-lg font-medium rounded-md text-center ${ // Increased padding
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.icon && <img src={link.icon} alt="" className="w-5 h-5 mr-2" />}
                <span>{link.name}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

