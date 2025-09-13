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

// Helper component for the bot's thinking indicator
const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
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
    // We start with a greeting from the assistant
    setMessages([
      {
        role: 'assistant',
        content: "Hi there! I'm SkillBot. I'm here to help you discover your hidden talents through a few fun questions. Ready to start your Skill Quest? Let's begin! What's a project or activity (inside or outside of school) that you felt really proud of?"
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
      // Send the entire conversation to our backend API
      const response = await fetch('/api/discover-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }

      const data = await response.json();
      
      // Check if the bot has completed the assessment
      if (data.isComplete) {
        setSuggestions(data);
        const finalBotMessage: Message = {
            role: 'assistant',
            content: "Great, I have all I need! Here is your personalized skill analysis."
        };
        setMessages(prevMessages => [...prevMessages, finalBotMessage]);
      } else {
        const assistantMessage: Message = { role: 'assistant', content: data.reply };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }

    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having a little trouble connecting. Please check your connection and try again."
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // UI for displaying the final skill suggestions
  const SuggestionsCard = ({ data }: { data: SkillSuggestions }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border border-blue-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Skill Quest Results!</h2>
        <p className="text-gray-600 mb-4">{data.summary}</p>
        
        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Your Top Skills:</h3>
        <div className="flex flex-wrap gap-2 mb-4">
            {data.topSkills.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
            ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Recommended Courses:</h3>
        <div className="space-y-3 mb-4">
            {data.suggestedCourses.map(course => (
                <div key={course.title} className="p-3 bg-gray-50 rounded-md border">
                    <p className="font-bold text-gray-800">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.description}</p>
                </div>
            ))}
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Your Next Step:</h3>
        {data.nextStep === 'resume' ? (
            <button className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                Go to AI Resume Feedback
            </button>
        ) : (
            <button className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
                Explore Jobs & Gigs
            </button>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800">SkillDash Discover</h1>
        <p className="text-center text-gray-500">Your Personal AI Career Guide</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg px-4 py-2 rounded-xl shadow ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="max-w-lg px-4 py-2 rounded-xl shadow bg-white text-gray-800 border">
                  <LoadingDots />
                 </div>
              </div>
            )}
            {suggestions && <SuggestionsCard data={suggestions} />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t p-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={suggestions ? "Your Skill Quest is complete!" : "Type your answer here..."}
              className="flex-1 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || !!suggestions}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
  );
}
