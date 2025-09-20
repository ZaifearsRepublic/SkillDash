'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
    </svg>
);

const ExclamationTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

// Loading component
const AuthLoadingScreen = () => (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
);

export default function HiringPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to access hiring features. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/opportunities/hiring');
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Big Back Button in a Box */}
          <div className="mb-8">
            <Link href="/opportunities" className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-lg">Back to Opportunities</span>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Hirer's <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Portal</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Connect with skilled talent and find the perfect candidates for your team.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          {/* Beta Notice */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-b border-orange-200 dark:border-orange-800/50 px-8 py-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  🚀 Beta Testing Phase
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
                  This website is still in <strong>beta testing</strong>. For posting jobs, please contact us via email. 
                  We will update this feature in a few hours after verifying everything is working perfectly.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Thank you for your patience as we ensure the best experience for both employers and job seekers!
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="px-8 py-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Post a Job?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Send us your job requirements and we'll help you find the perfect candidates from our talented community.
            </p>

            {/* Big Contact Button */}
            <a
              href="mailto:alshahoriar.hossain@gmail.com?subject=Job Posting Request - SkillDash&body=Hi SkillDash Team,%0D%0A%0D%0AI would like to post a job opportunity on your platform.%0D%0A%0D%0AJob Details:%0D%0APosition: [Enter position name]%0D%0ACompany: [Enter company name]%0D%0ALocation: [Enter location]%0D%0ARequirements: [Enter requirements]%0D%0A%0D%0APlease let me know the next steps.%0D%0A%0D%0AThank you!"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-bold py-6 px-12 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              
              <MailIcon />
              <span className="ml-3 relative z-10">Contact Us to Post Jobs</span>
              
              {/* Arrow animation */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>

            {/* Contact Info */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Direct email:</p>
              <a 
                href="mailto:alshahoriar.hossain@gmail.com" 
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                alshahoriar.hossain@gmail.com
              </a>
            </div>
          </div>

          {/* Features Preview */}
          <div className="bg-gray-50 dark:bg-gray-800/30 px-8 py-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Coming Soon Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Easy Job Posting</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Simple form to post job requirements</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Talent Pool</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Access to verified skilled candidates</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚡</span>
                </div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Quick Matching</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered candidate recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
