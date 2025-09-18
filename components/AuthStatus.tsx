'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, getUserProfile } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function AuthStatus() {
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const profile = await getUserProfile(currentUser.uid);
                setUserName(profile?.name || currentUser.email?.split('@')[0] || 'User');
            } else {
                setUserName(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    const handleLogin = () => {
        router.push('/auth');
    };
    
    const handleProfile = () => {
        router.push('/profile');
    }

    return (
        <div className="flex items-center gap-3">
            {user ? (
                 <>
                    {/* Updated Profile Button */}
                    <button
                        onClick={handleProfile}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <div className="flex items-baseline gap-1.5">
                            <span>Hi,</span>
                            <span className="font-bold">{userName}</span>
                        </div>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-md hover:shadow-lg transition-all"
                >
                    Login / Sign Up
                </button>
            )}
        </div>
    );
}