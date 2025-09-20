import React from 'react';
import Image from 'next/image';

interface TeamMemberProps {
  name: string;
  role: string;
  imageUrl: string;
  description: string;
  contactUrl: string;
  gradient: string;
  index: number;
}

const TeamMember: React.FC<TeamMemberProps> = ({ 
  name, role, imageUrl, description, contactUrl, gradient, index 
}) => {
  return (
    <div
      className={`group relative flex flex-col items-center text-center p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-200/30 dark:border-gray-700/50 backdrop-blur-sm bg-gradient-to-br ${gradient}`}
      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
    >
      {/* Floating decoration */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative w-36 h-36 mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white/50 dark:border-gray-700/50 transform group-hover:scale-110 transition-all duration-500">
        <Image
          src={imageUrl}
          alt={`${name} profile`}
          fill
          sizes="144px"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {name}
      </h2>
      
      <h3 className="text-sm font-semibold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent uppercase tracking-wide">
        {role}
      </h3>
      
      <p className="text-gray-700 dark:text-gray-300 mb-8 flex-grow leading-relaxed text-sm">
        {description}
      </p>
      
      <a
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 hover:from-blue-700 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
      >
        Get in Touch
      </a>
    </div>
  );
};

export default TeamMember;
