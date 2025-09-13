import React from 'react';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
          About SkillDash
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-12">
          Our mission is to empower the next generation of professionals in Bangladesh by bridging the gap between academic knowledge and real-world skills.
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
            <p>
              We envision a future where every student in Bangladesh graduates with the confidence, skills, and experience needed to thrive in the global job market. SkillDash was born from the desire to turn this vision into a reality, creating an ecosystem where learning is practical, engaging, and directly linked to career opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">What We Do</h2>
            <p>
              SkillDash is an all-in-one, AI-powered platform that transforms career preparation into an interactive journey. We help students discover their innate talents, provide them with curated learning paths to develop in-demand skills, and connect them with part-time jobs and freelance projects to gain invaluable hands-on experience.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
            <p>
              As part of the GP AI Future Maker competition, we are committed to tackling the national skill gap head-on. By leveraging cutting-edge AI, we aim to provide a scalable, accessible, and effective solution that prepares Bangladeshi youth for the jobs of tomorrow, today.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
