'use client';

import React, { useState, useRef, FormEvent, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// --- Type Definitions ---
type Step = 'industry' | 'resume' | 'job-description' | 'chat';

interface Message {
    role: 'user' | 'assistant';
    content: string | React.ReactNode;
}

// --- Helper Icons & Components ---
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

export default function ResumeFeedbackPage() {
    // --- State Management ---
    const [currentStep, setCurrentStep] = useState<Step>('industry');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form data
    const [industryPreference, setIndustryPreference] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [userInput, setUserInput] = useState('');
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        if(currentStep === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading, currentStep]);

    // Auto-resize textarea for follow-up chat
    useEffect(() => {
        if (currentStep === 'chat' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput, currentStep]);

    // --- Step Navigation and Data Handling ---
    const initializeConversation = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Perfect! I have all the information I need. I'll analyze your resume now and provide detailed feedback. After that, feel free to ask any follow-up questions!"
            }
        ]);
        setCurrentStep('chat');
    };

    const handleIndustryNext = () => {
        if (!industryPreference.trim()) {
            setError('Please enter your preferred industry');
            return;
        }
        setError('');
        setCurrentStep('resume');
    };

    const handleResumeNext = () => {
        if (!resumeText.trim()) {
            setError('Please paste your resume text');
            return;
        }
        if (resumeText.trim().length < 100) {
            setError('Resume text seems too short. Please provide a complete resume.');
            return;
        }
        setError('');
        setCurrentStep('job-description');
    };

    const handleSkipJobDescription = () => {
        setJobDescription('');
        startAnalysis(null);
    };
    
    const handleJobDescriptionNext = () => {
        startAnalysis(jobDescription);
    };

    // --- API Call and Feedback Display ---
    const startAnalysis = async (finalJobDescription: string | null) => {
        setIsLoading(true);
        setError('');
        initializeConversation();

        try {
            const requestData = {
                resumeText,
                industryPreference,
                jobDescription: finalJobDescription ? finalJobDescription.trim() : null,
                messages: []
            };
            const response = await fetch('/api/resume-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            displayFeedback(data);

        } catch (err: any) {
            console.error('Analysis error:', err);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, an error occurred: ${err.message}. Please try again.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const displayFeedback = (data: any) => {
        const formattedFeedback = (
            <div className="prose prose-blue dark:prose-invert max-w-none">
                <ReactMarkdown>{data.feedback}</ReactMarkdown>
                {data.providerInfo && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {data.providerInfo}
                    </div>
                )}
            </div>
        );
        setMessages(prev => [...prev, { role: 'assistant', content: formattedFeedback }]);
    };

    // --- Follow-up Chat Logic ---
    const handleFollowUpSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: userInput };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);
        setError('');
        setUserInput('');
        
        try {
            const response = await fetch('/api/resume-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    industryPreference,
                    jobDescription: jobDescription.trim() || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            displayFeedback(data);

        } catch (err: any) {
            console.error('Follow-up error:', err);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, an error occurred: ${err.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            // Trigger the correct action based on the current step
            if (currentStep === 'industry') handleIndustryNext();
            else if (currentStep === 'resume') handleResumeNext();
            else if (currentStep === 'job-description') handleJobDescriptionNext();
            else if (currentStep === 'chat') formRef.current?.requestSubmit();
        }
    };
    
    const resetFlow = () => {
        setCurrentStep('industry');
        setMessages([]);
        setIndustryPreference('');
        setResumeText('');
        setJobDescription('');
        setUserInput('');
        setError('');
    };
    
    // --- Render Logic for Different Steps ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 'industry':
                return (
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 1: Your Target Industry</h2>
                            <p className="text-gray-600 dark:text-gray-400">Which industry are you aiming for?</p>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={industryPreference}
                                onChange={(e) => setIndustryPreference(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g., Tech, Finance, Marketing..."
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                autoFocus
                            />
                            <button onClick={handleIndustryNext} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all">
                                Next: Provide Resume
                            </button>
                        </div>
                    </div>
                );

            case 'resume':
                return (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 2: Resume Content</h2>
                            <p className="text-gray-600 dark:text-gray-400">Paste your resume content below.</p>
                        </div>
                        <div className="space-y-4">
                            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Paste your resume content here (avoid personal details)..." className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" rows={10}/>
                            <div className="flex gap-3">
                                <button onClick={() => setCurrentStep('industry')} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>
                                <button onClick={handleResumeNext} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all">Next: Job Description</button>
                            </div>
                        </div>
                    </div>
                );
            
            case 'job-description':
                 return (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 3: Job Description (Optional)</h2>
                            <p className="text-gray-600 dark:text-gray-400">For more targeted feedback, paste a job description below.</p>
                        </div>
                        <div className="space-y-4">
                            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} onKeyDown={handleKeyDown} placeholder="Paste the job description you're targeting..." className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" rows={8}/>
                            <div className="flex gap-3">
                                <button onClick={() => setCurrentStep('resume')} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>
                                <button onClick={handleSkipJobDescription} className="px-6 py-3 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Skip & Analyze</button>
                                <button onClick={handleJobDescriptionNext} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all">Analyze Resume</button>
                            </div>
                        </div>
                    </div>
                );

            case 'chat':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && <BotIcon />}
                                    <div className={`max-w-full px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'}`}>
                                        {typeof msg.content === 'string' ? <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p> : msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3"><BotIcon /><div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none"><LoadingDots /></div></div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form ref={formRef} onSubmit={handleFollowUpSubmit} className="space-y-2">
                            <div className="flex items-end space-x-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-700 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                <textarea ref={textareaRef} value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask follow-up questions..." className="flex-1 w-full px-4 py-2 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 resize-none max-h-32" rows={1} disabled={isLoading}/>
                                <button type="submit" disabled={!userInput.trim() || isLoading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform active:scale-95 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                </button>
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Industry: <span className="font-medium">{industryPreference}</span>{jobDescription && <span> • Job-specific feedback</span>}</p>
                                <button type="button" onClick={resetFlow} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">Start New Analysis</button>
                            </div>
                        </form>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-black font-sans">
            <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            SkillDash Resume <span className="font-light bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Feedback AI</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentStep === 'industry' && 'Step 1 of 3: Choose your industry'}
                            {currentStep === 'resume' && 'Step 2 of 3: Provide your resume'}
                            {currentStep === 'job-description' && 'Step 3 of 3: Add job description (optional)'}
                            {currentStep === 'chat' && 'AI Analysis Complete - Ask follow-up questions'}
                        </p>
                    </div>
                    {currentStep !== 'chat' && (
                        <div className="flex space-x-2">
                            <div className={`w-3 h-3 rounded-full transition-colors ${currentStep === 'industry' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${currentStep === 'resume' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${currentStep === 'job-description' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        </div>
                    )}
                </div>
            </header>

            <main className={`flex-1 ${currentStep === 'chat' ? 'flex flex-col' : 'flex items-center justify-center'} p-4 md:p-6 transition-all duration-300`}>
                <div className={currentStep === 'chat' ? 'w-full max-w-4xl mx-auto flex flex-col h-full' : 'w-full'}>
                    {renderStepContent()}
                </div>
            </main>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mx-auto mb-4 w-full max-w-4xl rounded-r-lg">
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}

