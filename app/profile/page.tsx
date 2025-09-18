'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, getUserProfile, updateUserProfile, UserProfile } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

// --- Icons for the UI ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>;

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>({});
    const router = useRouter();

    useEffect(() => {
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
    }, [router]);

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

    if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center"><p>Loading...</p></div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 antialiased">
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 backdrop-blur-lg">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <img 
                            src="/profile/profile.png" // This now points to your default image for all users
                            alt="Profile" 
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-violet-500 shadow-lg flex-shrink-0"
                        />
                        <div className="flex-1 w-full text-center sm:text-left">
                            {!isEditing ? (
                                <>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">
                                        {profile?.name || user.email?.split('@')[0]}
                                    </h1>
                                    <p className="text-gray-500 dark:text-slate-400 break-all">{user.email}</p>
                                    <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                                        {profile?.age && <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium px-3 py-1 rounded-full">{profile.age} years old</span>}
                                        {profile?.status && <span className="bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-sm font-medium px-3 py-1 rounded-full">{profile.status}</span>}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Your Full Name" className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input type="number" name="age" value={formData.age || ''} onChange={handleInputChange} placeholder="Age" className="w-full sm:w-1/3 p-2 border rounded-md bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
                                        <select name="status" value={formData.status || ''} onChange={handleInputChange} className="w-full sm:w-2/3 p-2 border rounded-md bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
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
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg transition-colors">
                                <EditIcon /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button onClick={() => { setIsEditing(false); setFormData(profile || {}); }} className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="flex-1 bg-violet-600 text-white font-bold hover:bg-violet-700 rounded-lg transition-colors py-2">
                                    Save Changes
                                </button>
                            </>
                        )}
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-100 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                            <LogoutIcon /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}