import React from 'react';
import { Timestamp } from 'firebase/firestore';

// User Profile
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Timestamp;
    lastLoginAt: Timestamp;
    hasSeenManual?: boolean;
}

// Goal Categories
export type GoalCategory = 'health' | 'career' | 'learning' | 'relationships' | 'personal';

// Goal Status
export type GoalStatus = 'active' | 'archived';

// Milestone
export interface Milestone {
    id: string;
    title: string;
    completed: boolean;
    targetDate?: Timestamp;
    completedAt?: Timestamp;
}

// Goal
export interface Goal {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: GoalCategory;
    milestones: Milestone[];
    status: GoalStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Habit Schedule Types
export type HabitScheduleType = 'daily' | 'weekly' | 'custom';

// Habit Schedule
export interface HabitSchedule {
    type: HabitScheduleType;
    targetDays?: number[]; // 0-6 (Sunday-Saturday) for weekly
    targetFrequency?: number; // times per week for custom
}

// Habit
export interface Habit {
    id: string;
    userId: string;
    name: string;
    description: string;
    schedule: HabitSchedule;
    goalId?: string;
    color?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Habit Log Entry
export interface HabitLog {
    id: string;
    userId: string;
    habitId: string;
    date: string; // YYYY-MM-DD format
    completed: boolean;
    note?: string;
    createdAt: Timestamp;
}

// Journal Entry
export interface JournalEntry {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    content: string;
    emotions: string[];
    promptUsed?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Mood Scale (1-5)
export type MoodScale = 1 | 2 | 3 | 4 | 5;

// Mood Log
export interface MoodLog {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    timestamp: Timestamp;
    mood: MoodScale;
    emotions: string[];
    energy?: MoodScale;
    stress?: MoodScale;
    note?: string;
}

// Window State for OS interface
export type WindowState = 'open' | 'minimized' | 'maximized' | 'closed';

export interface WindowInstance {
    id: string;
    appId: string;
    title: string;
    state: WindowState;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
}

// Application Definition
export interface AppDefinition {
    id: string;
    name: string;
    icon: string;
    component: React.ComponentType;
    defaultSize: { width: number; height: number };
}
