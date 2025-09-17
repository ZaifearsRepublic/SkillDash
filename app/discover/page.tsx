'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';  // Absolute
import { useRouter } from 'next/navigation';

// ... (Keep the rest of your components like BotIcon, LoadingDots, etc.)
const BotIcon = () => (
    <img 
        src="/discover/discover-ai.png" 
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
}
interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  suggestedCourses: { title: string; description: string }[];
  nextStep: 'resume' | 'jobs';
}
// ...

export default function DiscoverPage() {
  const { user, loading, error } = useAuth();  // Added error
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);  // Local errors
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Handle auth error
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Autofocus input after message from bot
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
    setLocalError(null);  // Clear local error on submit

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

    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having a little trouble connecting. Please check your connection and try again."
      };
      setMessages(prev => [...prev, errorMessage]);
      setLocalError(err.message || 'Unknown error');
      console.error('Discover chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const SuggestionsCard = ({ data }: { data: SkillSuggestions }) => (
    <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg p-6 mt-6 border border-black/5 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Skill Discover AI has finished its job!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{data.summary}</p>
        
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-3">Your Top Skills</h3>
        <div className="flex flex-wrap gap-2 mb-6">
            {data.topSkills.map(skill => (
                <span key={skill} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1.5 rounded-full">{skill}</span>
            ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-3">Recommended Courses</h3>
        <div className="space-y-3 mb-6">
            {data.suggestedCourses.map(course => (
                <div key={course.title} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="font-bold text-gray-800 dark:text-white">{course.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{course.description}</p>
                </div>
            ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-4 mb-3">Your Next Step</h3>
        <div className="flex flex-col sm:flex-row gap-4">
             <a href="/learn-skill" className="flex-1 text-center bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md">
                Learn Skills
            </a>
            {data.nextStep === 'resume' ? (
                <a href="/resume-feedback" className="flex-1 text-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md">
                    Go to AI Resume Feedback
                </a>
            ) : (
                <a href="/opportunities" className="flex-1 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] shadow-md">
                    Explore Jobs & Gigs
                </a>
            )}
        </div>
    </div>
  );

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <p className="text-lg text-gray-500 dark:text-gray-400">Loading your Skill Quest...</p>
            </div>
        </div>
    );
  }

  if (localError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{localError}</p>
          <button onClick={() => setLocalError(null)} className="bg-blue-500 text-white px-4 py-2 rounded">Retry</button>
        </div>
      </div>
    );
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
                  <p className="text-base leading-relaxed">{msg.content}</p>
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
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
    </>
  );
}