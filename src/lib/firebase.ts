import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBkhrAEww_3rFyzA_mGwT8VU5bPAPPb8Ms",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mentalos-673f1.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mentalos-673f1",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mentalos-673f1.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "486031561340",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:486031561340:web:56ffd9a00a703345b32ff9",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6WMH7RQJ52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
