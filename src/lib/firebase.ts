import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkhrAEww_3rFyzA_mGwT8VU5bPAPPb8Ms",
    authDomain: "mentalos-673f1.firebaseapp.com",
    projectId: "mentalos-673f1",
    storageBucket: "mentalos-673f1.firebasestorage.app",
    messagingSenderId: "486031561340",
    appId: "1:486031561340:web:56ffd9a00a703345b32ff9",
    measurementId: "G-6WMH7RQJ52"
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
