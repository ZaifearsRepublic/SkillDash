import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    onAuthStateChanged, 
    signInWithPopup,
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- Type definition for the user profile data ---
// We remove photoURL as it's no longer saved here.
export interface UserProfile {
    name?: string;
    age?: number;
    status?: 'School' | 'College' | 'University' | 'Job' | 'Other';
    email?: string;
    phone?: string;
}

// --- Type definition for the sign-up data ---
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
const googleProvider = new GoogleAuthProvider();

export const getActionCodeSettings = () => ({
    url: `${window.location.origin}/auth`,
    handleCodeInApp: true,
});

export const signInWithGoogleAndCreateProfile = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    // If the profile does NOT exist, create it WITHOUT the photoURL.
    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName, 
            email: user.email,
            // photoURL is intentionally omitted.
            age: null, 
            status: 'Other', 
            phone: ''
        });
    }
    return user;
};

export const signUpWithEmailPasswordAndProfile = async (profileData: SignUpProfileData, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: profileData.name });
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        name: profileData.name, age: profileData.age, status: profileData.status,
        phone: profileData.phone || null, email: profileData.email
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
    onAuthStateChanged, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword
};