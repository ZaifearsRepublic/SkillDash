import React, { Suspense } from 'react';
import AboutHero from '../../components/AboutHero';
import TeamMember from '../../components/TeamMember';
import StorySection from '../../components/StorySection';

// Move team data to constants (better memory management)
const TEAM_MEMBERS = [
  {
    name: "MD AL Shahoriar Hossain",
    role: "Finance & Data Analytics Lead",
    imageUrl: "/about-us/shahoriar.png",
    description: "A Finance major with a passion for data-driven decision-making. Shahoriar's expertise in financial analysis, Excel, and Power BI drives the analytical core of SkillDash, ensuring our skill assessments and learning paths are backed by solid data.",
    contactUrl: "http://shahoriar.me/contact",
  },
  {
    name: "Tasnuva Jahan Lamiya",
    role: "Education & User Experience Lead",
    imageUrl: "/about-us/tasnuva.png",
    description: "With a passion for making learning accessible and enjoyable, Tasnuva's experience in online tutoring and instruction shapes the user-centric design of our Skill Courses. Her innovative mindset helps bridge the gap between academic knowledge and practical application.",
    contactUrl: "https://www.linkedin.com/in/tasnuva-jahan-lamiya/",
  },
  {
    name: "Tazrian Rahman",
    role: "Strategy & Community Lead",
    imageUrl: "/about-us/tazrian.png",
    description: "Tazrian brings extensive leadership and communication experience from his diverse roles in university clubs and internships. His skills in team management and public relations are vital for building the SkillDash community and forging connections with real-world opportunities.",
    contactUrl: "https://www.linkedin.com/in/tazrian-rahman-aa6822247/",
  },
] as const;

// Optimized gradient classes (reusable)
const CARD_GRADIENTS = [
  "from-blue-500/10 via-purple-500/5 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/10 dark:to-indigo-500/20",
  "from-pink-500/10 via-rose-500/5 to-purple-500/10 dark:from-pink-500/20 dark:via-rose-500/10 dark:to-purple-500/20",
  "from-violet-500/10 via-sky-500/5 to-cyan-500/10 dark:from-violet-500/20 dark:via-sky-500/10 dark:to-cyan-500/20"
] as const;

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 text-gray-800 dark:text-gray-200 py-12 sm:py-24 px-4 relative overflow-hidden">
      {/* OPTIMIZED: Reduced animated background elements from 4 to 2 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 dark:bg-blue-400/20 rounded-full animate-optimized-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-400/10 dark:bg-purple-400/20 rounded-full animate-optimized-pulse" style={{animationDelay: '1.5s'}} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="animate-fade-in-up">
          <AboutHero />
        </div>

        {/* Meet the Team Header */}
        <section className="text-center mb-16 md:mb-20">
          <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
              Meet the Team
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>
        </section>

        {/* Team Members Section - Optimized */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20 md:mb-32">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={member.name} className="animate-fade-in-up">
              <TeamMember
                {...member}
                gradient={CARD_GRADIENTS[idx % 3]}
                index={idx}
              />
            </div>
          ))}
        </section>

        {/* Story and Mission Sections */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl" />}>
          <StorySection />
        </Suspense>
      </div>
    </div>
  );
}
