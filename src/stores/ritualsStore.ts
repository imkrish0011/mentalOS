import { create } from 'zustand';
import type { Ritual, RitualStep } from '../types';
import {
    createRitual,
    getRituals,
    updateRitual,
    deleteRitual as firestoreDeleteRitual
} from '../lib/firestoreService';

interface RitualsState {
    rituals: Ritual[];
    isLoading: boolean;
    error: string | null;
    activeRitualId: string | null; // For the player

    // Actions
    setRituals: (rituals: Ritual[]) => void;
    addRitual: (userId: string, ritualData: Omit<Ritual, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    editRitual: (userId: string, ritualId: string, data: Partial<Ritual>) => Promise<void>;
    deleteRitual: (userId: string, ritualId: string) => Promise<void>;
    fetchRituals: (userId: string) => Promise<void>;
    setActiveRitualId: (id: string | null) => void;
}

export const useRitualsStore = create<RitualsState>((set, get) => ({
    rituals: [],
    isLoading: false,
    error: null,
    activeRitualId: null,

    setRituals: (rituals) => set({ rituals }),

    addRitual: async (userId, ritualData) => {
        try {
            set({ isLoading: true, error: null });
            await createRitual(userId, ritualData);
            // Refresh
            const rituals = await getRituals(userId);
            set({ rituals, isLoading: false });
        } catch (err) {
            console.error('Error adding ritual:', err);
            set({ error: 'Failed to add ritual', isLoading: false });
        }
    },

    editRitual: async (userId, ritualId, data) => {
        try {
            set({ isLoading: true, error: null });
            await updateRitual(userId, ritualId, data);
            // Refresh
            const rituals = await getRituals(userId);
            set({ rituals, isLoading: false });
        } catch (err) {
            console.error('Error updating ritual:', err);
            set({ error: 'Failed to update ritual', isLoading: false });
        }
    },

    deleteRitual: async (userId, ritualId) => {
        try {
            set({ isLoading: true, error: null });
            await firestoreDeleteRitual(userId, ritualId);
            set((state) => ({
                rituals: state.rituals.filter(r => r.id !== ritualId),
                isLoading: false
            }));
        } catch (err) {
            console.error('Error deleting ritual:', err);
            set({ error: 'Failed to delete ritual', isLoading: false });
        }
    },

    fetchRituals: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const rituals = await getRituals(userId);
            set({ rituals, isLoading: false });
        } catch (err) {
            console.error('Error fetching rituals:', err);
            set({ error: 'Failed to load rituals', isLoading: false });
        }
    },

    setActiveRitualId: (id) => set({ activeRitualId: id }),
}));
