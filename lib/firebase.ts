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

// Action code settings for email link authentication
const actionCodeSettings = {
  // This URL is where the user will be redirected after clicking the email link.
  // It must be the page that contains the logic to handle the sign-in.
  url: 'http://localhost:3000/auth', 
  // This must be true.
  handleCodeInApp: true,
};


export { auth, googleProvider, actionCodeSettings };

