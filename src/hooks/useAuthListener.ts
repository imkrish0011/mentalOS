import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    createHabit,
    createGoal,
    createJournalEntry
} from '../lib/firestoreService';
import { useAuthStore } from '../stores/authStore';

export const useAuthListener = () => {
    const {
        setUser,
        setUserProfile,
        setLoading,
        setInitialized,
        setError,
    } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Only set loading if not already initialized to prevent flashes
            // but for safety we can set it.
            setLoading(true);

            if (firebaseUser) {
                setUser(firebaseUser);

                try {
                    let profile = await getUserProfile(firebaseUser.uid);

                    if (!profile) {
                        // NEW USER: Create profile and seed default data
                        profile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || 'User',
                            photoURL: firebaseUser.photoURL || undefined,
                            createdAt: Timestamp.now(),
                            lastLoginAt: Timestamp.now(),
                        };
                        await createUserProfile(profile);

                        // --- SEED DEFAULT DATA ---
                        const now = new Date().toISOString().split('T')[0];

                        // 1. Default Habit
                        await createHabit(firebaseUser.uid, {
                            name: 'Drink Water',
                            description: 'Stay hydrated for clarity',
                            schedule: { type: 'daily', targetDays: [0, 1, 2, 3, 4, 5, 6] },
                            color: 'ocean',
                        });

                        // 2. Default Goal
                        await createGoal(firebaseUser.uid, {
                            title: 'Explore MentalOS',
                            description: 'Get familiar with your new mindful workspace',
                            category: 'personal',
                            status: 'active',
                            milestones: [
                                { id: 'm1', title: 'Check in with your Mood', completed: false },
                                { id: 'm2', title: 'Create your first Habit', completed: false },
                                { id: 'm3', title: 'Write a Journal entry', completed: false },
                            ],
                        });

                        // 3. Welcome Journal Entry
                        await createJournalEntry(firebaseUser.uid, {
                            date: now,
                            content: "Welcome to Mental Clarity OS. \n\nThis is your private space to reflect, plan, and grow. What's on your mind today?",
                            emotions: ['Calm', 'Motivated'],
                            promptUsed: 'Welcome',
                        });

                    } else {
                        // EXISTING USER: Update login time
                        await updateUserProfile(firebaseUser.uid, {
                            lastLoginAt: Timestamp.now(),
                        });
                    }

                    setUserProfile(profile);
                    setError(null);
                } catch (err) {
                    console.error('Error fetching/creating user profile:', err);
                    // Don't block the UI entirely, but show error
                    setError('Failed to load user profile. Please check your connection.');
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }

            setLoading(false);
            setInitialized(true);
        });

        return () => unsubscribe();
    }, [setUser, setUserProfile, setLoading, setInitialized, setError]);
};
