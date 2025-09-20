import React from 'react';

interface SkillBadgesProps {
  skills: string[];
  colorClass: string;
}

const SkillBadges = React.memo<SkillBadgesProps>(({ skills, colorClass }) => (
  <div className="flex flex-wrap gap-2">
    {skills.map((skill, index) => (
      <span 
        key={`${skill}-${index}`} 
        className={`${colorClass} text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap`}
      >
        {skill}
      </span>
    ))}
  </div>
));

SkillBadges.displayName = 'SkillBadges';
export default SkillBadges;
