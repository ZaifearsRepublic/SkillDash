'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const BotIcon = () => (
    <img 
        src="/skilldash-logo.png" 
        alt="SkillDash AI Avatar" 
        className="w-10 h-10 rounded-full shadow-md object-cover"
    />
);

const LoadingDots = () => (
  <div className="flex items-center space-x-1.5 px-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

// --- A neutral loading component to prevent the flicker ---
const AuthLoadingScreen = () => (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
);

interface Message {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
}

interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  nextStep: 'resume' | 'jobs';
}

// --- Enhanced Suggestions Card Component with JSON View ---
const SuggestionsCard: React.FC<{ data: SkillSuggestions }> = ({ data }) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    topSkills: true,
    skillsToDevelop: false,
    courses: false,
    nextSteps: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSkillBadges = (skills: string[], colorClass: string) => (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span key={index} className={`${colorClass} text-sm font-medium px-3 py-1.5 rounded-full`}>
          {skill}
        </span>
      ))}
    </div>
  );

  if (showRawJson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Raw JSON Data</h3>
          <button 
            onClick={() => setShowRawJson(false)}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            Show Cards
          </button>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-800 dark:text-gray-200">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      {/* Header with JSON Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skill Quest Complete! 🎉
            </h2>
          </div>
          <button 
            onClick={() => setShowRawJson(true)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            View JSON
          </button>
        </div>
        
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Top Skills Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('topSkills')}
          className="w-full px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">🌟 Your Top Skills</h3>
          <svg className={`w-5 h-5 text-blue-600 transform transition-transform ${expandedSections.topSkills ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.topSkills && (
          <div className="p-6">
            {renderSkillBadges(data.topSkills, "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200")}
          </div>
        )}
      </div>

      {/* Skills to Develop Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('skillsToDevelop')}
          className="w-full px-6 py-4 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 flex items-center justify-between hover:bg-orange-100 dark:hover:bg-orange-900/30"
        >
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">🎯 Skills to Develop</h3>
          <svg className={`w-5 h-5 text-orange-600 transform transition-transform ${expandedSections.skillsToDevelop ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.skillsToDevelop && (
          <div className="p-6">
            {renderSkillBadges(data.skillsToDevelop, "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200")}
          </div>
        )}
      </div>

      {/* Suggested Courses Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('courses')}
          className="w-full px-6 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900/30"
        >
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">📚 Recommended Courses</h3>
          <svg className={`w-5 h-5 text-green-600 transform transition-transform ${expandedSections.courses ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.courses && (
          <div className="p-6 space-y-4">
            {data.suggestedCourses.map((course, index) => (
              <div key={index} className="border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">{course.title}</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{course.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Steps Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button 
          onClick={() => toggleSection('nextSteps')}
          className="w-full px-6 py-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">🚀 Your Next Steps</h3>
          <svg className={`w-5 h-5 text-purple-600 transform transition-transform ${expandedSections.nextSteps ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.nextSteps && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a 
                href="/learn-skill" 
                className="text-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
              >
                <div className="text-2xl mb-2">📖</div>
                <div>Learn Skills</div>
              </a>
              
              {data.nextStep === 'resume' ? (
                <a 
                  href="/resume-feedback" 
                  className="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
                >
                  <div className="text-2xl mb-2">📄</div>
                  <div>AI Resume Feedback</div>
                </a>
              ) : (
                <a 
                  href="/opportunities" 
                  className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div>Explore Jobs & Gigs</div>
                </a>
              )}

              <a 
                href="/opportunities" 
                className="text-center bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div>Find Opportunities</div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to use the Discover feature. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/discover');
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions]);

  useEffect(() => {
    if(user){
      setMessages([
        {
          role: 'assistant',
          content: "Hi there! I'm SkillDashAI. Let's start your Skill Quest. If you had a completely free weekend to work on any project you wanted, what would you build or create?"
        }
      ]);
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || suggestions) return;

    const userMessage: Message = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/discover-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      let finalBotMessage: Message;
      if (data.isComplete) {
        setSuggestions(data);
        finalBotMessage = { role: 'assistant', content: "Great, I have all I need! Here is your personalized skill analysis." };
      } else {
        finalBotMessage = { role: 'assistant', content: data.reply };
      }
      setMessages(prev => [...prev, finalBotMessage]);

    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having a little trouble connecting. Please check your connection and try again."
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- THIS IS THE FIX ---
  // While loading, show the neutral loading screen.
  // The useEffect handles the redirect if the user is not logged in after loading.
  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return (
    <>
    <style jsx global>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.5s ease-out forwards;
      }
    `}</style>
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black font-sans antialiased">
      <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">SkillDash <span className="font-light bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Discover</span></h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Your Personal AI Career Guide</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <BotIcon />}
                <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'}`}>
                  {typeof msg.content === 'string' ? (
                    <p className="text-base leading-relaxed">{msg.content}</p>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in">
                 <BotIcon />
                 <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none">
                  <LoadingDots />
                 </div>
              </div>
            )}

            {suggestions && <SuggestionsCard data={suggestions} />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-t border-black/5 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={suggestions ? "Your Skill Quest is complete!" : "Type your answer here..."}
              className="flex-1 w-full px-5 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isLoading || !!suggestions}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading || !userInput.trim() || !!suggestions}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0721.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
    </>
  );
}
