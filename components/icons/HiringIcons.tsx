import React from 'react';

export const MailIcon = React.memo(() => (
  <svg 
    className="h-6 w-6" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    aria-label="Mail icon"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" 
    />
  </svg>
));
MailIcon.displayName = 'MailIcon';

export const CheckIcon = React.memo(() => (
  <svg 
    className="w-5 h-5" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    aria-label="Check icon"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 13l4 4L19 7" 
    />
  </svg>
));
CheckIcon.displayName = 'CheckIcon';

export const ArrowRightIcon = React.memo(() => (
  <svg 
    className="w-5 h-5" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    aria-label="Arrow right icon"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 5l7 7-7 7" 
    />
  </svg>
));
ArrowRightIcon.displayName = 'ArrowRightIcon';

export const BackIcon = React.memo(() => (
  <svg 
    className="w-5 h-5" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    aria-label="Back arrow icon"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 19l-7-7 7-7" 
    />
  </svg>
));
BackIcon.displayName = 'BackIcon';

// Loading spinner icon (bonus)
export const SpinnerIcon = React.memo(() => (
  <svg 
    className="animate-spin h-6 w-6" 
    fill="none" 
    viewBox="0 0 24 24"
    aria-label="Loading spinner"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));
SpinnerIcon.displayName = 'SpinnerIcon';

// Optional: All icons in one export for convenience
export const HiringIcons = {
  Mail: MailIcon,
  Check: CheckIcon,
  ArrowRight: ArrowRightIcon,
  Back: BackIcon,
  Spinner: SpinnerIcon,
} as const;
