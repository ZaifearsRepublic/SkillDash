'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Skill Quest', href: '/discover' },
    { name: 'Learn Skills', href: 'https://www.grameenphone.academy/', isExternal: true },
    { name: 'Resume Feedback', href: '/resume-feedback' },
    { name: 'Opportunities', href: '/opportunities' },
    { name: 'About Us', href: '/about-us' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <Image
              src="/skilldash-logo.png"
              alt="SkillDash Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span>SkillDash</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = !link.isExternal && pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  target={link.isExternal ? '_blank' : '_self'}
                  rel={link.isExternal ? 'noopener noreferrer' : ''}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

