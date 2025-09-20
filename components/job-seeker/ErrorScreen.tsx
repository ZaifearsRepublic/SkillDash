import React from 'react';

interface ErrorScreenProps {
  title: string;
  message: string;
  onRetry: () => void;
  icon?: string;
}

const ErrorScreen = React.memo<ErrorScreenProps>(({ 
  title, 
  message, 
  onRetry, 
  icon = "😕" 
}) => (
  <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
));

ErrorScreen.displayName = 'ErrorScreen';
export default ErrorScreen;
