import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    setDoc,
    onSnapshot,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Goal, Habit, HabitLog, UserProfile, JournalEntry, MoodLog, Ritual } from '../types';

// Collection paths
const USERS = 'users';
const GOALS = 'goals';
const HABITS = 'habits';
const HABIT_LOGS = 'habitLogs';
const JOURNAL = 'journal';
const MOOD_LOGS = 'moodLogs';
const REFLECTIONS = 'reflections';
const DECISIONS = 'decisions';
const PRINCIPLES = 'principles';
const RITUALS = 'rituals';

// Helper to get user's subcollection
const getUserCollection = (userId: string, collectionName: string) =>
    collection(db, USERS, userId, collectionName);

// ============= USER PROFILE =============

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
    await setDoc(doc(db, USERS, profile.uid), profile);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docSnap = await getDoc(doc(db, USERS, uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await updateDoc(doc(db, USERS, uid), data);
};

// ============= GOALS =============

export const createGoal = async (userId: string, goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = Timestamp.now();
    const docRef = await addDoc(getUserCollection(userId, GOALS), {
        ...goal,
        userId,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
};

export const getGoals = async (userId: string, status?: 'active' | 'archived'): Promise<Goal[]> => {
    // If filtering by status, don't use orderBy(createdAt) in Firestore query to avoid index requirement
    // Instead sort on client side
    const constraints: QueryConstraint[] = [];
    if (status) {
        constraints.push(where('status', '==', status));
    } else {
        constraints.push(orderBy('createdAt', 'desc'));
    }

    const q = query(getUserCollection(userId, GOALS), ...constraints);
    const snapshot = await getDocs(q);
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));

    if (status) {
        // Client-side sort if we couldn't do it on server
        goals.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });
    }

    return goals;
};

export const updateGoal = async (userId: string, goalId: string, data: Partial<Goal>): Promise<void> => {
    await updateDoc(doc(db, USERS, userId, GOALS, goalId), {
        ...data,
        updatedAt: Timestamp.now(),
    });
};

export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, GOALS, goalId));
};

export const subscribeToGoals = (
    userId: string,
    callback: (goals: Goal[]) => void,
    status?: 'active' | 'archived'
) => {
    // If filtering, remove server-side sort to avoid index
    const constraints: QueryConstraint[] = [];
    if (status) {
        constraints.push(where('status', '==', status));
    } else {
        constraints.push(orderBy('createdAt', 'desc'));
    }

    const q = query(getUserCollection(userId, GOALS), ...constraints);
    return onSnapshot(q, (snapshot) => {
        const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));

        if (status) {
            // Client-side sort
            goals.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });
        }

        callback(goals);
    });
};

// ============= HABITS =============

export const createHabit = async (userId: string, habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = Timestamp.now();
    const docRef = await addDoc(getUserCollection(userId, HABITS), {
        ...habit,
        userId,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
};

export const getHabits = async (userId: string): Promise<Habit[]> => {
    const q = query(getUserCollection(userId, HABITS), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
};

export const updateHabit = async (userId: string, habitId: string, data: Partial<Habit>): Promise<void> => {
    await updateDoc(doc(db, USERS, userId, HABITS, habitId), {
        ...data,
        updatedAt: Timestamp.now(),
    });
};

export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, HABITS, habitId));
};

export const subscribeToHabits = (userId: string, callback: (habits: Habit[]) => void) => {
    const q = query(getUserCollection(userId, HABITS), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
        callback(habits);
    });
};

// ============= HABIT LOGS =============

export const logHabit = async (userId: string, log: Omit<HabitLog, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    try {
        // Check if a log already exists for this habit and date (upsert pattern)
        // Using simple query to avoid composite index requirement
        const allLogsQuery = query(
            getUserCollection(userId, HABIT_LOGS),
            where('habitId', '==', log.habitId)
        );
        const allLogsSnapshot = await getDocs(allLogsQuery);

        // Find existing log for this date in JavaScript
        const existingDoc = allLogsSnapshot.docs.find(d => d.data().date === log.date);

        if (existingDoc) {
            // Update existing log
            await updateDoc(doc(db, USERS, userId, HABIT_LOGS, existingDoc.id), {
                completed: log.completed,
                note: log.note || null, // Ensure undefined becomes null
            });
            return existingDoc.id;
        } else {
            // Create new log
            const docRef = await addDoc(getUserCollection(userId, HABIT_LOGS), {
                habitId: log.habitId,
                date: log.date,
                completed: log.completed,
                note: log.note || null, // Ensure undefined becomes null
                userId,
                createdAt: Timestamp.now(),
            });
            return docRef.id;
        }
    } catch (error) {
        console.error('Error logging habit:', error);
        throw error; // Re-throw to let calling code handle it
    }
};

export const getHabitLogs = async (userId: string, habitId: string, _days: number = 30): Promise<HabitLog[]> => {
    try {
        // Simplified query - only filter by habitId to avoid composite index requirement
        const q = query(
            getUserCollection(userId, HABIT_LOGS),
            where('habitId', '==', habitId)
        );
        const snapshot = await getDocs(q);

        console.log(`[Firestore] Fetched ${snapshot.docs.length} logs for habit ${habitId}`);

        // Simply map and sort, DO NOT FILTER by date
        const logs = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as HabitLog))
            .sort((a, b) => b.date.localeCompare(a.date));

        return logs;
    } catch (error) {
        console.error('Error fetching habit logs:', error);
        return []; // Return empty array instead of throwing
    }
};

export const updateHabitLog = async (userId: string, logId: string, data: Partial<HabitLog>): Promise<void> => {
    await updateDoc(doc(db, USERS, userId, HABIT_LOGS, logId), data);
};

// ============= JOURNAL =============

export const createJournalEntry = async (userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = Timestamp.now();
    const docRef = await addDoc(getUserCollection(userId, JOURNAL), {
        ...entry,
        userId,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
};

export const getJournalEntries = async (userId: string, limit: number = 30): Promise<JournalEntry[]> => {
    const q = query(
        getUserCollection(userId, JOURNAL),
        orderBy('date', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
};

export const updateJournalEntry = async (userId: string, entryId: string, data: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
    const docRef = doc(db, USERS, userId, JOURNAL, entryId);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
};

export const deleteJournalEntry = async (userId: string, entryId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, JOURNAL, entryId));
};

// ============= MOOD LOGS =============

export const logMood = async (userId: string, mood: Omit<MoodLog, 'id' | 'userId'>): Promise<string> => {
    const docRef = await addDoc(getUserCollection(userId, MOOD_LOGS), {
        ...mood,
        userId,
    });
    return docRef.id;
};

export const getMoodLogs = async (userId: string, days: number = 30): Promise<MoodLog[]> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const q = query(
        getUserCollection(userId, MOOD_LOGS),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodLog));
};

export const updateMoodLog = async (userId: string, logId: string, data: Partial<Omit<MoodLog, 'id' | 'userId'>>): Promise<void> => {
    const docRef = doc(db, USERS, userId, MOOD_LOGS, logId);
    await updateDoc(docRef, {
        ...data,
        // Timestamp is usually not updated on edit unless specified, but we depend on frontend passing it
    });
};

export const deleteMoodLog = async (userId: string, logId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, MOOD_LOGS, logId));
};

// ============= REFLECTIONS =============

export interface Reflection {
    id: string;
    userId: string;
    date: string;
    wins: string[];
    challenges: string[];
    lessons: string[];
    gratitude: string[];
    createdAt: Timestamp;
}

export const createReflection = async (userId: string, reflection: Omit<Reflection, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(getUserCollection(userId, REFLECTIONS), {
        ...reflection,
        userId,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

export const getReflections = async (userId: string, limit: number = 30): Promise<Reflection[]> => {
    const q = query(
        getUserCollection(userId, REFLECTIONS),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as Reflection));
};

export const deleteReflection = async (userId: string, reflectionId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, REFLECTIONS, reflectionId));
};

export const updateReflection = async (userId: string, reflectionId: string, data: Partial<Omit<Reflection, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
    const docRef = doc(db, USERS, userId, REFLECTIONS, reflectionId);
    await updateDoc(docRef, { ...data });
};

// ============= DECISIONS =============

export interface Decision {
    id: string;
    userId: string;
    title: string;
    context: string;
    options: { name: string; pros: string[]; cons: string[] }[];
    chosen?: string;
    createdAt: Timestamp;
}

export const createDecision = async (userId: string, decision: Omit<Decision, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(getUserCollection(userId, DECISIONS), {
        ...decision,
        userId,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

export const getDecisions = async (userId: string, limit: number = 30): Promise<Decision[]> => {
    const q = query(
        getUserCollection(userId, DECISIONS),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({ id: doc.id, ...doc.data() } as Decision));
};

export const updateDecision = async (userId: string, decisionId: string, data: Partial<Decision>): Promise<void> => {
    await updateDoc(doc(db, USERS, userId, DECISIONS, decisionId), data);
};

export const deleteDecision = async (userId: string, decisionId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, DECISIONS, decisionId));
};

// ============= PRINCIPLES =============

export interface Principle {
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: Timestamp;
}

export const createPrinciple = async (userId: string, principle: Omit<Principle, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(getUserCollection(userId, PRINCIPLES), {
        ...principle,
        userId,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

export const getPrinciples = async (userId: string): Promise<Principle[]> => {
    const q = query(
        getUserCollection(userId, PRINCIPLES),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Principle));
};

export const deletePrinciple = async (userId: string, principleId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, PRINCIPLES, principleId));
};

// ============= RITUALS =============

export const createRitual = async (userId: string, ritual: Omit<Ritual, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const now = Timestamp.now();
    const docRef = await addDoc(getUserCollection(userId, RITUALS), {
        ...ritual,
        userId,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
};

export const getRituals = async (userId: string): Promise<Ritual[]> => {
    const q = query(
        getUserCollection(userId, RITUALS),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ritual));
};

export const updateRitual = async (userId: string, ritualId: string, data: Partial<Ritual>): Promise<void> => {
    await updateDoc(doc(db, USERS, userId, RITUALS, ritualId), {
        ...data,
        updatedAt: Timestamp.now(),
    });
};

export const deleteRitual = async (userId: string, ritualId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS, userId, RITUALS, ritualId));
};
