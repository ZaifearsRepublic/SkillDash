'use client';

import React, { useState, useCallback } from 'react';
// Try absolute path from project root
import { MailIcon, CheckIcon, ArrowRightIcon } from '../../components/icons/HiringIcons';

const ContactForm = React.memo(() => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Optimized: Move template to constant to avoid recreation
  const emailTemplate = "mailto:alshahoriar.hossain@gmail.com?subject=Job%20Posting%20Request%20-%20SkillDash&body=Hi%20SkillDash%20Team%2C%0A%0AI%20would%20like%20to%20post%20a%20job%20opportunity%20on%20your%20platform.%0A%0AJob%20Details%3A%0A%E2%80%A2%20Position%3A%20%5BEnter%20position%20name%5D%0A%E2%80%A2%20Company%3A%20%5BEnter%20company%20name%5D%0A%E2%80%A2%20Location%3A%20%5BEnter%20location%5D%0A%E2%80%A2%20Employment%20Type%3A%20%5BFull-time%2FPart-time%2FContract%2FInternship%5D%0A%E2%80%A2%20Experience%20Level%3A%20%5BEntry%2FMid%2FSenior%20level%5D%0A%E2%80%A2%20Requirements%3A%20%5BEnter%20key%20requirements%5D%0A%E2%80%A2%20Budget%2FSalary%20Range%3A%20%5BOptional%5D%0A%0AAdditional%20Information%3A%0A%E2%80%A2%20Job%20Description%3A%20%5BBrief%20description%5D%0A%E2%80%A2%20Application%20Deadline%3A%20%5BDate%5D%0A%E2%80%A2%20Contact%20Person%3A%20%5BName%20and%20title%5D%0A%0APlease%20let%20me%20know%20the%20next%20steps%20for%20posting%20this%20opportunity.%0A%0AThank%20you!";

  const handleEmailClick = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  }, []);

  return (
    <div className="px-8 py-12 text-center">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Find Top Talent?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
          Connect with skilled students and recent graduates. Send us your job requirements and we'll help you find the perfect candidates from our talented community.
        </p>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-center text-green-800 dark:text-green-200">
              <CheckIcon />
              <span className="ml-2 font-medium">Email client opened! We'll get back to you soon.</span>
            </div>
          </div>
        )}

        {/* Main CTA Button */}
        <a
          href={emailTemplate}
          onClick={handleEmailClick}
          className="group relative inline-flex items-center justify-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white font-bold py-6 px-12 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg mb-6"
          style={{ pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.7 : 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" />
          
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
              <span className="relative z-10">Opening Email...</span>
            </>
          ) : (
            <>
              <MailIcon />
              <span className="ml-3 relative z-10">Post Your Job Opportunity</span>
              <ArrowRightIcon />
            </>
          )}
        </a>
      </div>
    </div>
  );
});

ContactForm.displayName = 'ContactForm';
export default ContactForm;
