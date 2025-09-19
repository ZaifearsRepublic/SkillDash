// lib/firebase.ts - FIXED VERSION
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    onAuthStateChanged, 
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- Type definitions remain the same ---
export interface UserProfile {
    name?: string;
    age?: number;
    status?: 'School' | 'College' | 'University' | 'Job' | 'Other';
    email?: string;
    phone?: string;
}

interface SignUpProfileData {
    name: string;
    age: number | null;
    status: string;
    phone?: string;
    email: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase configuration.");
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// FIXED: Properly configure providers with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true'
});

export const getActionCodeSettings = () => ({
    url: `${window.location.origin}/auth`,
    handleCodeInApp: true,
});

// FIXED: Enhanced error handling and fallback to redirect
export const signInWithSocialProviderAndCreateProfile = async (
    provider: GoogleAuthProvider | GithubAuthProvider
) => {
    try {
        console.log('Attempting popup sign-in...');
        const result = await signInWithPopup(auth, provider);
        return await handleSocialSignInResult(result.user);
    } catch (error: any) {
        console.error('Popup sign-in failed:', error);
        
        // If popup is blocked or fails, try redirect as fallback
        if (error.code === 'auth/popup-blocked' || 
            error.code === 'auth/popup-closed-by-user' ||
            error.code === 'auth/cancelled-popup-request') {
            
            console.log('Falling back to redirect sign-in...');
            await signInWithRedirect(auth, provider);
            return null; // Will be handled by redirect result
        }
        
        throw error;
    }
};

// FIXED: Separate function to handle redirect results
export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            return await handleSocialSignInResult(result.user);
        }
        return null;
    } catch (error) {
        console.error('Redirect result error:', error);
        throw error;
    }
};

// FIXED: Common function to handle social sign-in user creation
const handleSocialSignInResult = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName || user.email?.split('@')[0] || 'User', 
            email: user.email,
            age: null, 
            status: 'Other', 
            phone: ''
        });
    }
    return user;
};

// Keep existing functions
export const signUpWithEmailPasswordAndProfile = async (profileData: SignUpProfileData, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: profileData.name });
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        name: profileData.name, 
        age: profileData.age, 
        status: profileData.status,
        phone: profileData.phone || null, 
        email: profileData.email
    });
    await sendEmailVerification(user);
    return user;
};

export const updateUserProfile = async (userId: string, data: any) => {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, data, { merge: true });
};

export const getUserProfile = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
};

export { 
    auth, 
    db,
    googleProvider,
    githubProvider,
    onAuthStateChanged, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword,
    getRedirectResult
};

// ============= FIXED AUTH PAGE COMPONENT =============
// app/auth/page.tsx - UPDATED VERSION

/*
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { 
    auth, 
    signUpWithEmailPasswordAndProfile, 
    googleProvider, 
    githubProvider, 
    signInWithSocialProviderAndCreateProfile,
    handleRedirectResult
} from '../../lib/firebase';
import { useRouter } from 'next/navigation';

// Icons remain the same...
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.533,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const GitHubIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
        // Handle redirect message
        const msg = sessionStorage.getItem('redirectMessage');
        if (msg) {
            setRedirectMessage(msg);
            sessionStorage.removeItem('redirectMessage');
        }

        // FIXED: Handle redirect results on page load
        const checkRedirectResult = async () => {
            try {
                const result = await handleRedirectResult();
                if (result) {
                    console.log('Redirect sign-in successful');
                    // The auth state change will handle the redirect
                }
            } catch (error: any) {
                console.error('Redirect result error:', error);
                setError(getReadableErrorMessage(error));
            }
        };
        
        checkRedirectResult();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/profile';
                sessionStorage.removeItem('redirectAfterLogin');
                router.push(redirectPath);
            }
        });
        return () => unsubscribe();
    }, [router]);

    // FIXED: Better error message handling
    const getReadableErrorMessage = (error: any): string => {
        const errorCode = error.code || '';
        
        switch (errorCode) {
            case 'auth/popup-blocked':
                return 'Pop-up was blocked. Please allow pop-ups for this site or try again.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled. Please try again.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection and try again.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please wait a moment before trying again.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with this email using a different sign-in method.';
            default:
                return error.message || 'An unexpected error occurred. Please try again.';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSignUp = async () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setMessage('');
        
        try {
            const profileData = {
                email: formData.email,
                name: formData.name,
                age: formData.age ? parseInt(formData.age, 10) : null,
                status: formData.status,
                phone: formData.phone
            };
            await signUpWithEmailPasswordAndProfile(profileData, formData.password);
            setMessage('Account created! Please check your inbox to verify your email.');
        } catch (err: any) {
            setError(getReadableErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (err: any) {
            setError(getReadableErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    // FIXED: Enhanced social sign-in handlers
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        
        try {
            console.log('Starting Google sign-in...');
            await signInWithSocialProviderAndCreateProfile(googleProvider);
            setMessage('Signing in with Google...');
        } catch (err: any) {
            console.error('Google sign-in error:', err);
            setError(getReadableErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubSignIn = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');
        
        try {
            console.log('Starting GitHub sign-in...');
            await signInWithSocialProviderAndCreateProfile(githubProvider);
            setMessage('Signing in with GitHub...');
        } catch (err: any) {
            console.error('GitHub sign-in error:', err);
            setError(getReadableErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        isSignUp ? handleSignUp() : handleSignIn();
    };

    // Rest of the component remains the same...
    const commonInputClasses = "w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500";

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 antialiased">
            <div className="max-w-md w-full bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 backdrop-blur-lg">
                <div className="text-center mb-6">
                    <img src="/skilldash-logo.png" alt="SkillDash Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {isSignUp ? 'Create an Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-600 dark:text-slate-300">
                        {isSignUp ? 'Join SkillDash to start your journey.' : 'Sign in to access your dashboard.'}
                    </p>
                </div>

                {redirectMessage && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 mb-4 rounded-md border border-blue-200 dark:border-blue-700">
                        <p className="text-blue-700 dark:text-blue-300 text-sm text-center">{redirectMessage}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <button 
                        onClick={handleGoogleSignIn} 
                        disabled={isLoading} 
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                    >
                        <GoogleIcon /> 
                        {isLoading ? 'Connecting...' : 'Continue with Google'}
                    </button>
                    <button 
                        onClick={handleGitHubSignIn} 
                        disabled={isLoading} 
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-lg text-white bg-[#24292e] hover:bg-[#1f2328] border-[#24292e] transition-colors disabled:opacity-50"
                    >
                        <GitHubIcon /> 
                        {isLoading ? 'Connecting...' : 'Continue with GitHub'}
                    </button>
                </div>

                // ... rest of the form remains the same
            </div>
        </div>
    );
}
*/