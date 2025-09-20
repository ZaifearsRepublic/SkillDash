import React from 'react';

interface JobDetailsLoadingScreenProps {
  isTimeout?: boolean;
  onRetry?: () => void;
}

const JobDetailsLoadingScreen = React.memo<JobDetailsLoadingScreenProps>(({ isTimeout = false, onRetry }) => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center px-4">
    {!isTimeout ? (
      <>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-center">Loading job details...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait a moment</p>
      </>
    ) : (
      <>
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Taking longer than expected</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
          The server might be slow to respond. Would you like to try again?
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        )}
      </>
    )}
  </div>
));

JobDetailsLoadingScreen.displayName = 'JobDetailsLoadingScreen';
export default JobDetailsLoadingScreen;
