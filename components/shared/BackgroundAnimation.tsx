import React from 'react';

const BackgroundAnimation = React.memo(() => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      <div 
        className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-optimized-bounce" 
        style={{ animationDelay: '0s', animationDuration: '4s' }}
      />
      <div 
        className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-optimized-bounce" 
        style={{ animationDelay: '2s', animationDuration: '3.5s' }}
      />
    </div>
  );
});

BackgroundAnimation.displayName = 'BackgroundAnimation';
export default BackgroundAnimation;
