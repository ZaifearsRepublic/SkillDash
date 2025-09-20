'use client';
import React from 'react';
import { GoogleIcon, GitHubIcon } from './AuthIcons';

interface SocialAuthProps {
  handleGoogleSignIn: () => void;
  handleGitHubSignIn: () => void;
  isLoading: boolean;
}

const SocialAuth: React.FC<SocialAuthProps> = ({
  handleGoogleSignIn,
  handleGitHubSignIn,
  isLoading
}) => {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      
      <button
        type="button"
        onClick={handleGitHubSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-gray-800 border border-gray-700 text-white font-medium py-3 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        <GitHubIcon />
        Continue with GitHub
      </button>
    </div>
  );
};

export default SocialAuth;
