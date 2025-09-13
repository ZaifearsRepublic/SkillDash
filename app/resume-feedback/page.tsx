import React from 'react';

// A simple inline SVG to replace the react-icons dependency
const FileSignatureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export default function ResumeFeedbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-black text-center px-4">
      <div className="w-24 h-24 p-6 flex items-center justify-center bg-green-100 dark:bg-green-900/50 rounded-2xl mb-6 text-green-500">
        <FileSignatureIcon />
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-4">
        AI Resume Feedback
      </h1>
      <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        This feature is coming soon! Get ready to upload your resume and receive instant, AI-powered feedback to make it perfect for your dream job.
      </p>
    </div>
  );
}

