'use client';

import { useState, useEffect } from 'react';
import { 
    signInWithPopup,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from 'firebase/auth';
import { auth, googleProvider, actionCodeSettings } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.533,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [notification, setNotification] = useState('');
    const router = useRouter();

    // Effect to handle redirect messages and email link sign-in
    useEffect(() => {
        // Check for a redirect message
        const redirectMessage = sessionStorage.getItem('authRedirectMessage');
        if (redirectMessage) {
            setNotification(redirectMessage);
            sessionStorage.removeItem('authRedirectMessage');
        }

        const handleEmailLinkSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                setMessage('Verifying your sign-in link, please wait...');
                setIsLoading(true);
                
                let storedEmail = window.localStorage.getItem('emailForSignIn');
                
                if (!storedEmail) {
                    storedEmail = window.prompt('Please provide your email for confirmation');
                }
                
                if (storedEmail) {
                    try {
                        await signInWithEmailLink(auth, storedEmail, window.location.href);
                        window.localStorage.removeItem('emailForSignIn');
                        window.history.replaceState({}, document.title, '/auth');
                        router.push('/profile');
                    } catch (err: any) {
                        setError(`Failed to sign in: ${err.message}`);
                        setMessage('');
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setError('Email not provided. Please try signing up again.');
                    setMessage('');
                    setIsLoading(false);
                }
            }
        };

        handleEmailLinkSignIn();
    }, [router]);

    const handleEmailSignIn = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMessage(`A sign-in link has been sent to ${email}! Check your inbox and spam folder.`);
            setEmail('');
        } catch (err: any) {
            setError(err.message || 'Failed to send sign-in link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            router.push('/profile');
        } catch (err: any) {
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        handleEmailSignIn();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 relative">
                
                {notification && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-center shadow-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{notification}</p>
                        <button onClick={() => setNotification('')} className="absolute top-1 right-2 text-yellow-600 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-100">&times;</button>
                    </div>
                )}
                
                <div className="text-center mb-8">
                    <img src="/skilldash-logo.png" alt="SkillDash Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        Sign In or Sign Up
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your email for a password-free magic link.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="your@email.com"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" 
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    
                    {message && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                            <p className="text-green-600 dark:text-green-400 text-sm">{message}</p>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || !email} 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                            OR
                        </span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        <GoogleIcon />
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
