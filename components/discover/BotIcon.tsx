import React from 'react';
import Image from 'next/image';

const BotIcon = React.memo(() => (
  <div className="w-10 h-10 rounded-full shadow-md overflow-hidden flex-shrink-0">
    <Image 
      src="/skilldash-logo.png" 
      alt="SkillDash AI"
      width={40}
      height={40}
      className="object-cover"
      priority
    />
  </div>
));

BotIcon.displayName = 'BotIcon';
export default BotIcon;
