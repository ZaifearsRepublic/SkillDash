'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MessageBubble from '../../components/discover/MessageBubble';
import LoadingDots from '../../components/discover/LoadingDots';

// Lazy load heavy components
const SuggestionsCard = dynamic(() => import('../../components/discover/SuggestionsCard'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

// Optimized loading screen
const AuthLoadingScreen = () => (
  <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
  </div>
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string; // Add unique ID for better React keys
}

interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  nextStep: 'resume' | 'jobs';
}

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SkillSuggestions | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounter = useRef(0);

  // Auth redirect effect
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to use the Discover feature. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/discover');
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Auto-focus input
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions, scrollToBottom]);

  // Initialize conversation
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm SkillDashAI. Let's start your Skill Quest. If you had a completely free weekend to work on any project you wanted, what would you build or create?"
      }]);
    }
  }, [user, messages.length]);

  // Optimized form submission
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || suggestions) return;

    const messageId = `msg-${++messageIdCounter.current}`;
    const userMessage: Message = { 
      id: messageId, 
      role: 'user', 
      content: userInput.trim() 
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/discover-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(({ id, ...msg }) => msg) // Remove id for API
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const botMessageId = `bot-${++messageIdCounter.current}`;

      if (data.isComplete) {
        setSuggestions(data);
        const finalBotMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: "Great, I have all I need! Here is your personalized skill analysis." 
        };
        setMessages(prev => [...prev, finalBotMessage]);
      } else {
        const botMessage: Message = { 
          id: botMessageId,
          role: 'assistant', 
          content: data.reply 
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessageId = `error-${++messageIdCounter.current}`;
      const errorMessage: Message = {
        id: errorMessageId,
        role: 'assistant',
        content: "Sorry, I'm having a little trouble connecting. Please check your connection and try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, suggestions, messages]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  }, []);

  // Show loading screen while authenticating
  if (loading || !user) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-black font-sans antialiased">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          SkillDash <span className="font-light bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Discover</span>
        </h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Your Personal AI Career Guide</p>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 chat-container">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}

            {isLoading && (
              <MessageBubble
                role="assistant"
                content={<LoadingDots />}
                isLoading
              />
            )}

            {suggestions && <SuggestionsCard data={suggestions} />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Footer */}
      <footer className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-t border-black/5 p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder={suggestions ? "Your Skill Quest is complete!" : "Type your answer here..."}
              className="flex-1 w-full px-5 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              disabled={isLoading || !!suggestions}
              maxLength={500} // Prevent extremely long inputs
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
