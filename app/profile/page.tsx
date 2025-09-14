'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/auth');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }
    
    if (!user) {
        return null; // Redirect is handled in the effect
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Welcome to your SkillDash dashboard!
                </p>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{user.email}</p>
                </div>
                
                <button 
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-xl transition-all"
                >
                    Log Out
                </button>
            </div>
        </div>
    );
}

