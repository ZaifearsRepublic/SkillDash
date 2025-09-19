'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
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

    const handleAuthAction = () => {
        if (user) {
            router.push('/profile');
        } else {
            router.push('/auth');
        }
    };

    return (
        <div className="flex items-center">
            <button
                onClick={handleAuthAction}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-md hover:shadow-lg transition-all"
            >
                {user && userName ? (
                    <div className="flex items-baseline gap-1.5">
                        <span>Hi,</span>
                        <span className="font-bold">{userName}</span>
                    </div>
                ) : (
                    <span>Join</span>
                )}
            </button>
        </div>
    );
}