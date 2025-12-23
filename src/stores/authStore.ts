import { create } from 'zustand';
import { User } from 'firebase/auth';
import type { UserProfile } from '../types';

interface AuthState {
    user: User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setUserProfile: (profile: UserProfile | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const initialState = {
    user: null,
    userProfile: null,
    isLoading: true,
    isInitialized: false,
    error: null,
};

export const useAuthStore = create<AuthState>((set) => ({
    ...initialState,

    setUser: (user) => set({ user }),
    setUserProfile: (profile) => set({ userProfile: profile }),
    setLoading: (loading) => set({ isLoading: loading }),
    setInitialized: (initialized) => set({ isInitialized: initialized }),
    setError: (error) => set({ error }),
    reset: () => set(initialState),
}));
