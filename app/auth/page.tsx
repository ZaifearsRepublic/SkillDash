'use client';

import { useState, useEffect } from 'react';
import {
    signInWithPopup,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, getActionCodeSettings } from '../../lib/firebase';
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
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingLink, setIsProcessingLink] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [redirectMessage, setRedirectMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const msg = sessionStorage.getItem('redirectMessage');
        if (msg) {
            setRedirectMessage(msg);
            sessionStorage.removeItem('redirectMessage');
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
            let storedEmail = window.localStorage.getItem('emailForSignIn');
            if (!storedEmail) {
                storedEmail = window.prompt('Please provide your email for confirmation');
            }
            if (storedEmail) {
                signInWithEmailLink(auth, storedEmail, window.location.href)
                    .catch(() => setError("Failed to sign in. The link may be expired or invalid."))
                    .finally(() => {
                        window.localStorage.removeItem('emailForSignIn');
                        window.history.replaceState({}, document.title, "/auth");
                    });
            } else {
                setError("Could not find email to complete sign-in.");
                setIsProcessingLink(false);
            }
        } else {
            setIsProcessingLink(false);
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/profile';
                sessionStorage.removeItem('redirectAfterLogin');
                router.push(redirectPath);
            } else {
                if (!isSignInWithEmailLink(auth, window.location.href)) {
                    setIsProcessingLink(false);
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleSignUp = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            setMessage('Account created! Please check your inbox to verify your email address.');
        } catch (err: any) {
            setError(err.message || 'Failed to create account.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Check your email and password.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLinkSignIn = async () => {
        if (!validateEmail(email)) {
            setError('Please enter a valid email to receive a magic link.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const actionCodeSettings = getActionCodeSettings();
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMessage(`A sign-in link has been sent to ${email}! Check your inbox.`);
        } catch (err: any) {
            setError(err.message || 'Failed to send sign-in link.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err: any) {
            setError('Failed to sign in with Google.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        if (isSignUp) {
            handleSignUp();
        } else {
            handleSignIn();
        }
    };

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

    if (isProcessingLink) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Completing Sign In...</h1>
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="text-center mb-8">
                    <img src="/skilldash-logo.png" alt="SkillDash Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {isSignUp ? 'Create an Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Sign up to continue.' : 'Sign in to your account.'}
                    </p>
                </div>

                {redirectMessage && <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4"><p className="text-blue-700 dark:text-blue-300 text-sm text-center">{redirectMessage}</p></div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 dark:text-white" />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 dark:text-white" />
                    </div>

                    {/* ::: NEW FORGOT PASSWORD TOOLTIP ::: */}
                    <div className="text-right text-sm">
                        <div className="relative inline-block group">
                            <span className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 cursor-pointer">
                                Forgot your password?
                            </span>
                            <div className="absolute bottom-full left-1/2 z-10 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                Please use the "Sign in with a Magic Link" option below.
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                    {/* ::: END OF NEW CODE ::: */}

                    {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3"><p className="text-red-600 dark:text-red-400 text-sm">{error}</p></div>}
                    {message && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3"><p className="text-green-600 dark:text-green-400 text-sm">{message}</p></div>}
                    
                    <button type="submit" disabled={isLoading || !email || password.length < 6} className="w-full bg-violet-600 text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition-all disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="text-center mt-4 text-sm">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700" /></div><div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">OR</span></div></div>

                <div className="space-y-3">
                    <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
                        <GoogleIcon /> Sign in with Google
                    </button>
                    <button onClick={handleMagicLinkSignIn} disabled={isLoading || !validateEmail(email)} className="w-full text-sm text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Sign in with a Magic Link
                    </button>
                </div>
            </div>
        </div>
    );
}