'use client';

import { useState, useEffect } from 'react';
import {
    signInWithPopup,
    isSignInWithEmailLink,
    signInWithEmailLink,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider, signUpWithEmailPasswordAndProfile } from '../../lib/firebase';
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
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', age: '',
        status: '', password: '', confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
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
             // Magic link logic can be expanded here if needed
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/profile';
                sessionStorage.removeItem('redirectAfterLogin');
                router.push(redirectPath);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignUp = async () => {
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
        setIsLoading(true); setError(''); setMessage('');
        try {
            const profileData = {
                email: formData.email, name: formData.name,
                age: formData.age ? parseInt(formData.age, 10) : null,
                status: formData.status, phone: formData.phone
            };
            await signUpWithEmailPasswordAndProfile(profileData, formData.password);
            setMessage('Account created! Please check your inbox to verify your email.');
        } catch (err: any) { setError(err.message || 'Failed to create account.'); } 
        finally { setIsLoading(false); }
    };

    const handleSignIn = async () => {
        setIsLoading(true); setError('');
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (err: any) { setError('Failed to sign in. Please check your email and password.'); } 
        finally { setIsLoading(false); }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true); setError('');
        try { await signInWithPopup(auth, googleProvider); } 
        catch (err: any) { setError('Failed to sign in with Google.'); } 
        finally { setIsLoading(false); }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        isSignUp ? handleSignUp() : handleSignIn();
    };

    const commonInputClasses = "w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 antialiased">
            <div className="max-w-md w-full bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 backdrop-blur-lg">
                <div className="text-center mb-6">
                    <img src="/skilldash-logo.png" alt="SkillDash Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1>
                    <p className="text-gray-600 dark:text-slate-300">{isSignUp ? 'Join SkillDash to start your journey.' : 'Sign in to access your dashboard.'}</p>
                </div>

                {redirectMessage && <div className="bg-blue-50 dark:bg-blue-900/20 p-3 mb-4 rounded-md border border-blue-200 dark:border-blue-700"><p className="text-blue-700 dark:text-blue-300 text-sm text-center">{redirectMessage}</p></div>}

                <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                    <GoogleIcon /> Continue with Google
                </button>

                <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-slate-600" /></div><div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-slate-800 px-2 text-gray-500 dark:text-slate-400">OR</span></div></div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp ? (
                        <>
                            <input name="name" onChange={handleInputChange} required placeholder="Full Name *" className={commonInputClasses}/>
                            <input name="email" type="email" onChange={handleInputChange} required placeholder="Email Address *" className={commonInputClasses}/>
                            <div className="flex gap-4">
                                <input name="age" type="number" onChange={handleInputChange} placeholder="Age" className={`${commonInputClasses} w-1/2`}/>
                                <input name="phone" type="tel" onChange={handleInputChange} placeholder="Phone (Optional)" className={`${commonInputClasses} w-1/2`}/>
                            </div>
                            <select name="status" onChange={handleInputChange} required className={`${commonInputClasses} ${formData.status === '' ? 'text-gray-400 dark:text-gray-500' : ''}`}>
                                <option value="">Select Your Status *</option>
                                <option value="School">School (Class 1-10)</option>
                                <option value="College">College (Class 11-12)</option>
                                <option value="University">University</option>
                                <option value="Job">In a Job</option>
                                <option value="Other">Other</option>
                            </select>
                            <input name="password" type="password" onChange={handleInputChange} required placeholder="Password *" className={commonInputClasses}/>
                            <input name="confirmPassword" type="password" onChange={handleInputChange} required placeholder="Retype Password *" className={commonInputClasses}/>
                        </>
                    ) : (
                        <>
                            <input name="email" type="email" onChange={handleInputChange} required placeholder="Email Address" className={commonInputClasses}/>
                            <input name="password" type="password" onChange={handleInputChange} required placeholder="Password" className={commonInputClasses}/>
                        </>
                    )}

                    {error && <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700"><p className="text-red-700 dark:text-red-300 text-sm">{error}</p></div>}
                    {message && <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-md border border-green-300 dark:border-green-700"><p className="text-green-700 dark:text-green-300 text-sm">{message}</p></div>}
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-violet-600 text-white font-bold py-3 rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="text-center mt-6 text-sm">
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }} className="font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}