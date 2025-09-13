"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';

// Define the structure of a message in our chat
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Define the structure for the final suggestions from the bot
interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  suggestedCourses: { title: string; description: string }[];
  nextStep: 'resume' | 'jobs';
}

// SVG Icon for our AI bot
const BotIcon = () => (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M12 5.25v-1.5m0 15v1.5m3.75-18v1.5m-7.5 0v1.5m7.5 15v-1.5m-7.5 0v-1.5m15-7.5H3.75c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5Z" />
        </svg>
    </div>
);

// Helper component for the bot's thinking indicator
const LoadingDots = () => (
  <div className="flex items-center space-x-1.5 px-2">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

// Main component for the Discover Page
export default function DiscoverPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to automatically scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start the conversation when the component loads
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi there! I'm SkillDashAI. I'm here to help you discover your hidden talents through a few fun questions. Ready to start your Skill Quest? Let's begin! What's a project or activity (inside or outside of school) that you felt really proud of?"
      }
    ]);
  }, []);

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

  // Modern UI for displaying the final skill suggestions
  const SuggestionsCard = ({ data }: { data: SkillSuggestions }) => (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6 mt-6 border border-black/5 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Skill Quest Results!</h2>
        <p className="text-gray-600 mb-6">{data.summary}</p>
        
        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-3">Your Top Skills</h3>
        <div className="flex flex-wrap gap-2 mb-6">
            {data.topSkills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">{skill}</span>
            ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-3">Recommended Courses</h3>
        <div className="space-y-3 mb-6">
            {data.suggestedCourses.map(course => (
                <div key={course.title} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-bold text-gray-800">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.description}</p>
                </div>
            ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-3">Your Next Step</h3>
        {data.nextStep === 'resume' ? (
            <button className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all transform hover:scale-[1.02] shadow-md">
                Go to AI Resume Feedback
            </button>
        ) : (
            <button className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-600 transition-all transform hover:scale-[1.02] shadow-md">
                Explore Jobs & Gigs
            </button>
        )}
    </div>
  );

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
    <div className="flex flex-col h-screen bg-gray-100 font-sans antialiased">
      <header className="bg-white/80 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-gray-800">SkillDash <span className="font-light">Discover</span></h1>
        <p className="text-center text-sm text-gray-500">Your Personal AI Career Guide</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <BotIcon />}
                <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                  <p className="text-base leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in">
                 <BotIcon />
                 <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                  <LoadingDots />
                 </div>
              </div>
            )}

            {suggestions && <SuggestionsCard data={suggestions} />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-lg border-t border-black/5 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={suggestions ? "Your Skill Quest is complete!" : "Type your answer here..."}
              className="flex-1 w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isLoading || !!suggestions}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading || !userInput.trim() || !!suggestions}
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

