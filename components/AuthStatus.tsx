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

    // Helper function to get first name only
    const getFirstName = (fullName: string) => {
        return fullName.split(' ')[0];
    };

    return (
        <div className="flex items-center">
            <button
                onClick={handleAuthAction}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-md hover:shadow-lg transition-all whitespace-nowrap"
            >
                {user && userName ? (
                    <div className="flex items-baseline gap-1 sm:gap-1.5">
                        <span>Hi,</span>
                        {/* ✅ Show first name only on mobile, full name on desktop */}
                        <span className="font-bold">
                            <span className="sm:hidden">{getFirstName(userName)}</span>
                            <span className="hidden sm:inline">{userName}</span>
                        </span>
                    </div>
                ) : (
                    <span>Join</span>
                )}
            </button>
        </div>
    );
}
