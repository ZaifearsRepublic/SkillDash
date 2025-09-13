import React from 'react';

// Data for the team members
const teamMembers = [
  {
    name: "MD AL Shahoriar Hossain",
    role: "Finance & Data Analytics Lead",
    imageUrl: "/about-us/shahoriar.png",
    description:
      "A Finance major with a passion for data-driven decision-making. Shahoriar's expertise in financial analysis, Excel, and Power BI drives the analytical core of SkillDash, ensuring our skill assessments and learning paths are backed by solid data.",
    contactUrl: "http://shahoriar.me/contact",
  },
  {
    name: "Tasnuva Jahan Lamiya",
    role: "Education & User Experience Lead",
    imageUrl: "/about-us/tasnuva.png",
    description:
      "With a passion for making learning accessible and enjoyable, Tasnuva's experience in online tutoring and instruction shapes the user-centric design of our Skill Courses. Her innovative mindset helps bridge the gap between academic knowledge and practical application.",
    contactUrl: "https://www.linkedin.com/in/tasnuva-jahan-lamiya/",
  },
  {
    name: "Tazrian Rahman",
    role: "Strategy & Community Lead",
    imageUrl: "/about-us/tazrian.png",
    description:
      "Tazrian brings extensive leadership and communication experience from his diverse roles in university clubs and internships. His skills in team management and public relations are vital for building the SkillDash community and forging connections with real-world opportunities.",
    contactUrl: "https://www.linkedin.com/in/tazrian-rahman-aa6822247/",
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-800 dark:text-gray-200 py-12 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* About at Top */}
        <section className="text-center mb-16 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            About SkillDash
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            We are a passionate team of students dedicated to empowering the youth of Bangladesh by bridging the gap between education and employment.
          </p>
        </section>

        {/* Meet the Team Header */}
        <section className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Meet the Team
          </h2>
        </section>

        {/* Team Members Section (colorful cards, not b&w) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-16 md:mb-24">
          {teamMembers.map((member, idx) => (
            <div
              key={member.name}
              className={`group relative flex flex-col items-center text-center p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br ${
                [
                  "from-blue-50 via-purple-100 to-blue-200",
                  "from-pink-50 via-purple-100 to-blue-100",
                  "from-violet-50 via-sky-100 to-purple-100"
                ][idx % 3]
              }`}
            >
              <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-800 transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src={member.imageUrl}
                  alt={`Profile picture of ${member.name}`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  style={{ filter: "none" }} // no grayscale
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
              <h3 className="text-md font-semibold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                {member.role}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow">{member.description}</p>
              <a
                href={member.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none active:scale-100"
              >
                Contact
              </a>
            </div>
          ))}
        </section>

        {/* The Idea Section */}
        <section className="mb-16 md:mb-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">How the Idea Was Born</h2>
          <p className="max-w-4xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
            The journey of SkillDash started with a simple question: 
            <span className="italic"> "Why do so many talented students in Bangladesh struggle to land jobs or internships, despite years of study?"</span>
            Observing friends, classmates, and our own journeys, we noticed a clear and persistent mismatch between what is taught in classrooms and what employers actually seek. Grades and degrees alone were not enough—what really mattered were practical, demonstrable skills, confidence, and a clear path to real-world experience.
          </p>
          <p className="max-w-4xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
            As university students ourselves, we wrestled with traditional self-discovery quizzes, endless lists of online courses, and confusing, generic job boards. Much of it felt broken or overwhelming. We wanted something smarter: an ecosystem that could 
            <b> show </b>
            students their hidden strengths, guide their growth with the help of AI, and directly connect learning to practical work opportunities. 
          </p>
          <p className="max-w-4xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">
            The call for ideas from the <b>GP AI Future Maker competition</b> was the catalyst. It gave us the perfect challenge and the spark to assemble a team—combining backgrounds in finance, education, strategy, and community leadership. From the start, 
            <b>SkillDash aimed to turn the daunting job prep journey into an accessible, gamified, and personalized web platform</b>
            —built by students, for students.
          </p>
        </section>

        {/* Our Mission Section */}
        <section className="mb-16 md:mb-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
          <p className="max-w-4xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">
            SkillDash was born from a simple but powerful idea: to close the gap between the theoretical knowledge gained in the classroom and the practical, real-world skills demanded by today's employers. We leverage cutting-edge AI to create a personalized and engaging journey for every student, guiding them from self-discovery to career-readiness and connecting them with tangible opportunities.
          </p>
        </section>

        {/* Our Journey Section */}
        <section className="mb-16 md:mb-24 text-center bg-gray-50 dark:bg-gray-900/50 py-16 px-6 rounded-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">The Spark Behind the Project</h2>
          <p className="max-w-4xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">
            The initial boost to bring SkillDash to life came from the opportunity to participate in the{' '}
            <a
              href="https://gpfuturemakers.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              GP AI Future Maker
            </a>
            {' '}competition. This challenge inspired us to harness the power of artificial intelligence to solve a critical issue facing our peers. It provided the momentum to build a platform that could genuinely empower the future leaders of Bangladesh.
          </p>
        </section>
      </div>
    </div>
  );
}
