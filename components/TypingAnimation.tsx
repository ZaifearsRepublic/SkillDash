'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

const TypingAnimation = () => {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const skills = useMemo(() => [
    "Digital Marketing", "Graphic Design", "Web Development", "Content Creation", "Public Speaking",
    "Data Analysis", "Project Management", "UI/UX Design", "Financial Models", "Creative Writing",
    "Video Editing", "Ethical Hacking", "SEO Optimization", "Critical Thinking", "Leadership",
    "AI Prompting", "App Development", "Cloud Computing", "E-commerce", "Cybersecurity"
  ], []);

  const handleTyping = useCallback(() => {
    const fullText = skills[currentSkillIndex];
    
    if (isDeleting) {
      setDisplayedText(prev => fullText.substring(0, prev.length - 1));
    } else {
      setDisplayedText(prev => fullText.substring(0, prev.length + 1));
    }

    if (!isDeleting && displayedText === fullText) {
      setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setCurrentSkillIndex((prev) => (prev + 1) % skills.length);
    }
  }, [displayedText, isDeleting, currentSkillIndex, skills]);

  useEffect(() => {
    let frameId: number;
    let lastTime = 0;
    const typingSpeed = isDeleting ? 50 : 100;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= typingSpeed) {
        handleTyping();
        lastTime = currentTime;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [handleTyping, isDeleting]);

  return (
    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-bold">
      {displayedText}
      <span className="animate-pulse text-blue-400">|</span>
    </span>
  );
};

export default TypingAnimation;
