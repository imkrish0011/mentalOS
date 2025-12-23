import { useCallback } from 'react';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
    const {
        user,
        userProfile,
        isLoading,
        isInitialized,
        error,
        setLoading,
        setError,
        reset
    } = useAuthStore();

    // Initialize auth listener
    // Auth listener is now handled by useAuthListener hook in App.tsx

    // Sign in with Google
    const signInWithGoogle = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Failed to sign in. Please try again.');
            setLoading(false);
        }
    }, [setLoading, setError]);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            await firebaseSignOut(auth);
            // reset(); // REMOVED: Listener handles state updates to avoid race conditions
        } catch (err) {
            console.error('Sign out error:', err);
            setError('Failed to sign out');
            setLoading(false);
        }
    }, [setLoading, setError]);

    return {
        user,
        userProfile,
        isLoading,
        isInitialized,
        isAuthenticated: !!user,
        error,
        signInWithGoogle,
        signOut,
    };
};
