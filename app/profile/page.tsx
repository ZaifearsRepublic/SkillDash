'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, getUserProfile, updateUserProfile, UserProfile } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

// --- Icons for the UI ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;

// Loading component
const LoadingScreen = () => (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
        {/* Animated background elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
            <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
            <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your profile...</p>
        </div>
    </div>
);

export default function ProfilePage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({});
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/auth');
            return;
        }

        if (authUser) {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    setUser(currentUser);
                    const userProfile = await getUserProfile(currentUser.uid);
                    setProfile(userProfile);
                    setFormData(userProfile || {});
                    if (!userProfile?.name) {
                        setIsEditing(true);
                    }
                } else {
                    router.push('/auth');
                }
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [router, authUser, authLoading]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };

    const handleSave = async () => {
        if (!user || !formData.name) return;
        await updateUserProfile(user.uid, formData);
        setProfile(formData);
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading || authLoading) return <LoadingScreen />;
    if (!user) return null;

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
            {/* Animated background elements - same as homepage */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
                <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        {/* ✅ Smaller Back Button */}
                        <div className="mb-8">
                            <Link href="/" className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-800 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Back to Dashboard</span>
                            </Link>
                        </div>

                        <div className="text-center">
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Manage your personal information and account settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
                        
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 px-8 py-12 text-center border-b border-gray-200/50 dark:border-gray-800/50">
                            {/* Profile Picture */}
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 shadow-xl">
                                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                                        <img 
                                            src="/profile/profile.png" 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </div>

                            {!isEditing ? (
                                <div className="animate-fade-in-up">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {profile?.name || user.email?.split('@')[0] || 'User'}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 break-all">{user.email}</p>
                                    
                                    {/* Profile Tags */}
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {profile?.age && (
                                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
                                                {profile.age} years old
                                            </span>
                                        )}
                                        {profile?.status && (
                                            <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-sm font-medium px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800">
                                                {profile.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto space-y-4 animate-fade-in-up">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
                                    
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name || ''} 
                                        onChange={handleInputChange} 
                                        placeholder="Your Full Name" 
                                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input 
                                            type="number" 
                                            name="age" 
                                            value={formData.age || ''} 
                                            onChange={handleInputChange} 
                                            placeholder="Your Age" 
                                            className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500 dark:placeholder-gray-400"
                                        />
                                        
                                        <select 
                                            name="status" 
                                            value={formData.status || ''} 
                                            onChange={handleInputChange} 
                                            className="p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        >
                                            <option value="">Select Status...</option>
                                            <option value="School">School (Class 1-10)</option>
                                            <option value="College">College (Class 11-12)</option>
                                            <option value="University">University</option>
                                            <option value="Job">In a Job</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="px-8 py-8">
                            {!isEditing ? (
                                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="group flex items-center justify-center gap-3 flex-1 px-6 py-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800"
                                    >
                                        <EditIcon />
                                        <span>Edit Profile</span>
                                    </button>
                                    
                                    <button 
                                        onClick={handleLogout} 
                                        className="group flex items-center justify-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-red-200 dark:border-red-800"
                                    >
                                        <LogoutIcon />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                    <button 
                                        onClick={() => { setIsEditing(false); setFormData(profile || {}); }} 
                                        className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 border border-gray-200 dark:border-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    
                                    <button 
                                        onClick={handleSave} 
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
