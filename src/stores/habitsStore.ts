import { create } from 'zustand';
import type { Habit, HabitLog } from '../types';
import {
    createHabit,
    getHabits,
    updateHabit,
    deleteHabit as firestoreDeleteHabit,
    logHabit,
    getHabitLogs,
    subscribeToHabits
} from '../lib/firestoreService';

interface HabitsState {
    habits: Habit[];
    habitLogs: Record<string, HabitLog[]>; // habitId -> logs
    isLoading: boolean;
    error: string | null;

    // Actions
    setHabits: (habits: Habit[]) => void;
    addHabit: (userId: string, habitData: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    editHabit: (userId: string, habitId: string, data: Partial<Habit>) => Promise<void>;
    removeHabit: (userId: string, habitId: string) => Promise<void>; // Deprecated in favor of deleteHabit but kept for compatibility
    deleteHabit: (userId: string, habitId: string) => Promise<void>;
    logHabitCompletion: (userId: string, habitId: string, date: string, completed: boolean, note?: string) => Promise<void>;
    fetchHabits: (userId: string) => Promise<void>;
    fetchHabitLogs: (userId: string, habitId: string, days?: number) => Promise<void>;
    subscribeToUserHabits: (userId: string) => () => void;
    getConsistencyScore: (habitId: string, days?: number) => number;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
    habits: [],
    habitLogs: {},
    isLoading: false,
    error: null,

    setHabits: (habits) => set({ habits }),

    addHabit: async (userId, habitData) => {
        try {
            set({ isLoading: true, error: null });
            await createHabit(userId, habitData);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error adding habit:', err);
            set({ error: 'Failed to add habit', isLoading: false });
        }
    },

    editHabit: async (userId, habitId, data) => {
        try {
            set({ isLoading: true, error: null });
            await updateHabit(userId, habitId, data);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error updating habit:', err);
            set({ error: 'Failed to update habit', isLoading: false });
        }
    },

    removeHabit: async (userId, habitId) => {
        try {
            set({ isLoading: true, error: null });
            await firestoreDeleteHabit(userId, habitId);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error deleting habit:', err);
            set({ error: 'Failed to delete habit', isLoading: false });
        }
    },

    deleteHabit: async (userId, habitId) => {
        try {
            set({ isLoading: true, error: null });
            await firestoreDeleteHabit(userId, habitId);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error deleting habit:', err);
            set({ error: 'Failed to delete habit', isLoading: false });
        }
    },

    logHabitCompletion: async (userId, habitId, date, completed, note) => {
        // Immediately update local state for instant UI feedback
        const currentLogs = get().habitLogs[habitId] || [];
        const existingLogIndex = currentLogs.findIndex(l => l.date === date);

        let updatedLogs: HabitLog[];
        if (existingLogIndex >= 0) {
            updatedLogs = [...currentLogs];
            updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], completed };
        } else {
            const newLog: HabitLog = {
                id: `temp-${Date.now()}`,
                habitId,
                userId,
                date,
                completed,
                note,
                createdAt: new Date() as any,
            };
            updatedLogs = [newLog, ...currentLogs];
        }

        // Update state immediately
        set((state) => ({
            habitLogs: { ...state.habitLogs, [habitId]: updatedLogs },
        }));

        // Persist to Firestore in background (don't await to prevent blocking)
        logHabit(userId, { habitId, date, completed, note })
            .then(() => {
                // Silently refresh from server
                getHabitLogs(userId, habitId, 30).then(logs => {
                    set((state) => ({
                        habitLogs: { ...state.habitLogs, [habitId]: logs },
                    }));
                }).catch(err => console.error('Error refreshing logs:', err));
            })
            .catch(err => {
                console.error('Error saving habit log:', err);
                // Don't revert - just log the error
            });
    },

    fetchHabits: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const habits = await getHabits(userId);
            set({ habits, isLoading: false });
        } catch (err) {
            console.error('Error fetching habits:', err);
            set({ error: 'Failed to load habits', isLoading: false });
        }
    },

    fetchHabitLogs: async (userId, habitId, days = 30) => {
        try {
            const logs = await getHabitLogs(userId, habitId, days);
            set((state) => ({
                habitLogs: { ...state.habitLogs, [habitId]: logs },
            }));
        } catch (err) {
            console.error('Error fetching habit logs:', err);
        }
    },

    subscribeToUserHabits: (userId) => {
        const unsubscribe = subscribeToHabits(userId, (habits) => {
            set({ habits });
        });
        return unsubscribe;
    },

    // Calculate consistency score (0-100) based on recent logs
    getConsistencyScore: (habitId, days = 14) => {
        const logs = get().habitLogs[habitId] || [];
        if (logs.length === 0) return 0;

        const completedDays = logs.filter((l) => l.completed).length;
        const score = Math.round((completedDays / days) * 100);
        return Math.min(score, 100);
    },
}));
