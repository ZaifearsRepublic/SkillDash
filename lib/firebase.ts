import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required environment variables are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error("Missing Firebase configuration. Please check your .env.local file.");
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Determine the base URL dynamically for email link authentication.
// This is crucial for making sure the link works in both development and production (e.g., on Vercel).
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` // Vercel provides this variable
  : 'http://localhost:3000';           // Fallback for local development

const actionCodeSettings = {
  // The URL to redirect to after the user signs in.
  // This URL must be whitelisted in the Firebase Console.
  url: `${baseUrl}/auth`,
  // This must be true for email link sign-in.
  handleCodeInApp: true,
};

export { auth, googleProvider, actionCodeSettings };
