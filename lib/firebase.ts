import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- Type definition for the new user profile data ---
interface UserProfileData {
    name: string;
    age: number | null;
    status: string;
    phone?: string;
    email: string;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error("Missing Firebase configuration. Please check your .env.local file.");
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const getActionCodeSettings = () => ({
    url: `${window.location.origin}/auth`,
    handleCodeInApp: true,
});

// --- New Comprehensive Sign-Up Function ---
export const signUpWithEmailPasswordAndProfile = async (profileData: UserProfileData, password: string) => {
    // Step 1: Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, password);
    const user = userCredential.user;

    // Step 2: Update the user's display name in Firebase Auth
    await updateProfile(user, { displayName: profileData.name });

    // Step 3: Create the user's profile document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        name: profileData.name,
        age: profileData.age,
        status: profileData.status,
        phone: profileData.phone || null,
        email: profileData.email
    });
    
    // Step 4: Send a verification email
    await sendEmailVerification(user);

    return user;
};


// --- Existing Firestore and Auth Functions ---
export const updateUserProfile = async (userId: string, data: any) => {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, data, { merge: true });
};

export const getUserProfile = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export { 
    auth, 
    db,
    googleProvider, 
    onAuthStateChanged, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword
};