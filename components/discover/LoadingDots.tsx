import React from 'react';

const LoadingDots = React.memo(() => (
  <div className="flex items-center space-x-1.5 px-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce loading-dot-1" />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce loading-dot-2" />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce loading-dot-3" />
  </div>
));

LoadingDots.displayName = 'LoadingDots';
export default LoadingDots;
