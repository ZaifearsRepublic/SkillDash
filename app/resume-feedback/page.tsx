'use client';

import React, { useState, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';

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

interface Message {
    isUser: boolean;
    text: string | React.ReactNode;
}

export default function ResumeFeedbackPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            isUser: false,
            text: "Hello! To get started, please tell me two things:\n1. Do you have any preference to work in any industry? (e.g., 'Tech', 'Finance')\n2. Upload your resume (PDF, max 200KB) or paste its content below.\n\nTip: If your PDF is too large, pasting the text is a great alternative!"
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChangeAndSubmit = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Invalid file type. Please upload a PDF.');
            return;
        }
        if (file.size > 200 * 1024) { // 200 KB
            setError('File is too large (max 200KB). Try pasting the content instead.');
            return;
        }

        setError('');

        const userMessage = userInput
            ? `Industry Preference: ${userInput}\nFile Uploaded: ${file.name}`
            : `File Uploaded: ${file.name}`;

        setMessages(prev => [...prev, { isUser: true, text: userMessage }]);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('resumeFile', file);
        if (userInput) {
            formData.append('industryPreference', userInput);
        }

        sendResumeData(formData);
        setUserInput(''); // Clear text input after file upload
    };

    const handleTextSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        setMessages(prev => [...prev, { isUser: true, text: userInput }]);
        setIsLoading(true);

        const formData = new FormData();
        // Simple logic to separate preference from resume content
        const lines = userInput.split('\n');
        const industryPreference = lines[0];
        const resumeContent = lines.slice(1).join('\n');

        formData.append('industryPreference', industryPreference);
        formData.append('resumeText', resumeContent);

        sendResumeData(formData);
        setUserInput('');
    };

    const sendResumeData = async (formData: FormData) => {
        try {
            const response = await fetch('/api/resume-feedback', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'Failed to get feedback from the server.';
                try {
                    // Attempt to parse a JSON error response from our API
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If the response isn't JSON, it might be an HTML error page
                    console.error("Received a non-JSON error response from the server.");
                    errorMessage = `An unexpected server error occurred (Status: ${response.status}). Please try again.`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const formattedFeedback = (
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <ReactMarkdown>{data.feedback}</ReactMarkdown>
              </div>
            );
            setMessages(prev => [...prev, { isUser: false, text: formattedFeedback }]);

        } catch (err: any) {
            setMessages(prev => [...prev, { isUser: false, text: `Sorry, an error occurred: ${err.message}` }]);
            console.error(err);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-black font-sans">
            <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">SkillDash Resume <span className="font-light bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Feedback AI</span></h1>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Get Instant AI Feedback to Perfect Your Resume</p>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            {!msg.isUser && <BotIcon />}
                            <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-sm ${msg.isUser ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'}`}>
                                {typeof msg.text === 'string' ? <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p> : msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <BotIcon />
                            <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none">
                                <LoadingDots />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-t border-black/5 p-4 sticky bottom-0">
                <form onSubmit={handleTextSubmit} className="max-w-3xl mx-auto space-y-2">
                    <div className="flex items-center space-x-3 bg-white dark:bg-gray-900 rounded-full border border-gray-300 dark:border-gray-700 p-2 shadow-sm">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type industry preference and paste resume, or upload..."
                            className="flex-1 w-full px-4 py-2 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                         <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChangeAndSubmit}
                            ref={fileInputRef}
                            className="hidden"
                            id="resume-upload"
                            disabled={isLoading}
                        />
                        <label htmlFor="resume-upload" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        </label>
                        <button
                            type="submit"
                            disabled={!userInput.trim() || isLoading}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform active:scale-95"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs text-center px-4">{error}</p>}
                </form>
            </footer>
        </div>
    );
}

