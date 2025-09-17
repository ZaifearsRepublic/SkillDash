'use client';

import React, { useState, useEffect } from 'react';

// Updated and expanded list with shorter, Gen-Z relevant skills
const skills = [
  "Digital Marketing", "Graphic Design", "WebDev", "Content Creation", "Public Speaking",
  "Data Analysis", "Project Mgmt", "UI/UX Design", "Financial Models", "Creative Writing",
  "Video Editing", "Ethical Hacking", "SEO", "Critical Thinking", "Leadership",
  "AI Prompting", "App Development", "Cloud Computing", "E-commerce", "Cybersecurity"
];

const TypingAnimation = () => {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = isDeleting ? 50 : 100;

  useEffect(() => {
    const handleTyping = () => {
      const fullText = skills[currentSkillIndex];

      if (isDeleting) {
        // Deleting text
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
      } else {
        // Typing text
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
      }

      // Logic to switch between typing and deleting for a seamless loop
      if (!isDeleting && displayedText === fullText) {
        // Pause at the end of typing before starting to delete
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayedText === '') {
        // Move to the next skill after deleting is complete
        setIsDeleting(false);
        setCurrentSkillIndex((prev) => (prev + 1) % skills.length);
      }
    };

    const timeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentSkillIndex]);

  return (
    <span className="inline-block whitespace-nowrap bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent min-h-[48px] sm:min-h-[56px]">
      {displayedText}
      <span className="opacity-75 animate-pulse">|</span>
    </span>
  );
};

export default TypingAnimation;

