'use client';

import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-white dark:bg-black">
      <div className="max-w-md">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
          404
        </h1>
        
        <p className="text-5xl font-mono text-gray-800 dark:text-gray-200 my-4">
          ¯\_(ツ)_/¯
        </p>

        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! It seems the page you're looking for doesn't exist or has been moved. Don't worry, I made this website using AI, so it was bound to happen XD.
        </p>

        <Link href="/" className="inline-block bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none active:scale-100">
            Return to Homepage
        </Link>
      </div>
    </div>
  );
}

