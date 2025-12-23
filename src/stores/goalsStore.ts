import { create } from 'zustand';
import type { Goal, Milestone } from '../types';
import {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    subscribeToGoals
} from '../lib/firestoreService';
import { Timestamp } from 'firebase/firestore';

interface GoalsState {
    goals: Goal[];
    isLoading: boolean;
    error: string | null;
    selectedCategory: string | null;

    // Actions
    setGoals: (goals: Goal[]) => void;
    addGoal: (userId: string, goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    editGoal: (userId: string, goalId: string, data: Partial<Goal>) => Promise<void>;
    removeGoal: (userId: string, goalId: string) => Promise<void>;
    archiveGoal: (userId: string, goalId: string) => Promise<void>;
    toggleMilestone: (userId: string, goalId: string, milestoneId: string) => Promise<void>;
    setSelectedCategory: (category: string | null) => void;
    fetchGoals: (userId: string) => Promise<void>;
    subscribeToUserGoals: (userId: string) => () => void;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
    goals: [],
    isLoading: false,
    error: null,
    selectedCategory: null,

    setGoals: (goals) => set({ goals }),

    addGoal: async (userId, goal) => {
        try {
            set({ isLoading: true, error: null });
            await createGoal(userId, goal);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error adding goal:', err);
            set({ error: 'Failed to add goal', isLoading: false });
        }
    },

    editGoal: async (userId, goalId, data) => {
        try {
            set({ isLoading: true, error: null });
            await updateGoal(userId, goalId, data);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error updating goal:', err);
            set({ error: 'Failed to update goal', isLoading: false });
        }
    },

    removeGoal: async (userId, goalId) => {
        try {
            set({ isLoading: true, error: null });
            await deleteGoal(userId, goalId);
            set({ isLoading: false });
        } catch (err) {
            console.error('Error deleting goal:', err);
            set({ error: 'Failed to delete goal', isLoading: false });
        }
    },

    archiveGoal: async (userId, goalId) => {
        try {
            await updateGoal(userId, goalId, { status: 'archived' });
        } catch (err) {
            console.error('Error archiving goal:', err);
            set({ error: 'Failed to archive goal' });
        }
    },

    toggleMilestone: async (userId, goalId, milestoneId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return;

        const updatedMilestones = goal.milestones.map((m) =>
            m.id === milestoneId
                ? { ...m, completed: !m.completed, completedAt: !m.completed ? Timestamp.now() : undefined }
                : m
        );

        try {
            await updateGoal(userId, goalId, { milestones: updatedMilestones });
        } catch (err) {
            console.error('Error toggling milestone:', err);
            set({ error: 'Failed to update milestone' });
        }
    },

    setSelectedCategory: (category) => set({ selectedCategory: category }),

    fetchGoals: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const goals = await getGoals(userId);
            set({ goals, isLoading: false });
        } catch (err) {
            console.error('Error fetching goals:', err);
            set({ error: 'Failed to load goals', isLoading: false });
        }
    },

    subscribeToUserGoals: (userId) => {
        const unsubscribe = subscribeToGoals(userId, (goals) => {
            set({ goals });
        });
        return unsubscribe;
    },
}));
