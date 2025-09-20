'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, signUpWithEmailPasswordAndProfile, googleProvider, githubProvider, signInWithSocialProviderAndCreateProfile } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword, sanitizeError, rateLimit } from '../../lib/authUtils';
import AuthForm from '../../components/AuthForm';
import SocialAuth from '../../components/SocialAuth';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', age: '', status: '', password: '', confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Secure auth state management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/profile';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      }
    });
    return unsubscribe;
  }, [router]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  }, []);

  const handleSignUp = async () => {
    // Rate limiting
    if (!rateLimit(`signup_${formData.email}`)) {
      setError('Too many signup attempts. Please try again later.');
      return;
    }

    // Client-side validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.name?.trim() || formData.name.length < 2) {
      setError('Please enter a valid name (at least 2 characters).');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const profileData = {
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        age: formData.age ? Math.max(13, Math.min(100, parseInt(formData.age, 10))) : null,
        status: formData.status,
        phone: formData.phone?.trim() || ''
      };
      
      await signUpWithEmailPasswordAndProfile(profileData, formData.password);
      setMessage('Account created! Please check your email for verification.');
    } catch (err: any) {
      setError(sanitizeError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    // Rate limiting
    if (!rateLimit(`signin_${formData.email}`)) {
      setError('Too many login attempts. Please try again later.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, formData.email.trim().toLowerCase(), formData.password);
    } catch (err: any) {
      setError(sanitizeError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!rateLimit('google_signin')) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await signInWithSocialProviderAndCreateProfile(googleProvider);
    } catch (err: any) {
      setError(sanitizeError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (!rateLimit('github_signin')) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await signInWithSocialProviderAndCreateProfile(githubProvider);
    } catch (err: any) {
      setError(sanitizeError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    isSignUp ? handleSignUp() : handleSignIn();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Join SkillDash to start your journey.' : 'Sign in to access your dashboard.'}
          </p>
        </div>

        <SocialAuth 
          handleGoogleSignIn={handleGoogleSignIn}
          handleGitHubSignIn={handleGitHubSignIn}
          isLoading={isLoading}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>

        <AuthForm
          isSignUp={isSignUp}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          message={message}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
