// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase correctly to avoid re-initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Dynamic URL for different environments
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client side - use current window location
    return `${window.location.protocol}//${window.location.host}`;
  }
  // Server side fallback
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

// Action code settings for email link authentication
const actionCodeSettings = {
  // Dynamic URL that works in both dev and production
  url: `${getBaseURL()}/auth`,
  // This must be true.
  handleCodeInApp: true,
};

export { auth, googleProvider, actionCodeSettings };