import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useHabitsStore } from '../../stores/habitsStore';
import { Plus, Sparkles, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Habit, HabitSchedule, HabitScheduleType } from '../../types';

const habitColors = [
    { value: 'sage', class: 'bg-sage-400' },
    { value: 'ocean', class: 'bg-ocean-400' },
    { value: 'terracotta', class: 'bg-terracotta-400' },
    { value: 'purple', class: 'bg-purple-400' },
    { value: 'pink', class: 'bg-pink-400' },
];

export const HabitsApp: React.FC = () => {
    const { user } = useAuth();
    const { habits, habitLogs, isLoading, subscribeToUserHabits, addHabit, deleteHabit, logHabitCompletion, fetchHabitLogs } = useHabitsStore();
    const [showNewHabit, setShowNewHabit] = useState(false);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const [newHabit, setNewHabit] = useState({
        name: '',
        description: '',
        scheduleType: 'daily' as HabitScheduleType,
        color: 'sage'
    });

    // Use manual date formatting to guarantee YYYY-MM-DD regardless of browser locale
    const getSafeToday = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getSafeToday();

    console.log('DEBUG: Today is', today);
    console.log('DEBUG: Store logs:', habitLogs);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToUserHabits(user.uid);
        return () => unsubscribe();
    }, [user, subscribeToUserHabits]);

    // Fetch logs for all habits
    useEffect(() => {
        if (!user || habits.length === 0) return;
        habits.forEach((habit) => {
            fetchHabitLogs(user.uid, habit.id, 14);
        });
    }, [user, habits, fetchHabitLogs]);

    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => {
            setToast({ message: '', visible: false });
        }, 3000);
    };

    const handleAddHabit = async () => {
        if (!user || !newHabit.name.trim()) return;

        const schedule: HabitSchedule = {
            type: newHabit.scheduleType,
            targetDays: newHabit.scheduleType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : undefined,
        };

        await addHabit(user.uid, {
            name: newHabit.name,
            description: newHabit.description,
            schedule,
            color: newHabit.color,
        });

        showToast('Habit created! 🌱');
        setNewHabit({ name: '', description: '', scheduleType: 'daily', color: 'sage' });
        setShowNewHabit(false);
    };

    const isCompletedToday = (habitId: string) => {
        const logs = habitLogs[habitId] || [];
        return logs.some((l) => l.date === today && l.completed);
    };

    const handleToggleToday = (habitId: string) => {
        if (!user) return;
        const completed = !isCompletedToday(habitId);
        // State updates synchronously, Firebase persists in background
        logHabitCompletion(user.uid, habitId, today, completed);
        showToast(completed ? 'Checked in! ✅' : 'Check-in removed');
    };

    const handleDeleteHabit = async (habitId: string, habitName: string) => {
        if (!user) return;
        await deleteHabit(user.uid, habitId);
        showToast(`${habitName} deleted`);
    };

    // Get last 7 days for the mini calendar
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Toast Notification */}
            <AnimatePresence>
                {toast.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-charcoal-800 text-white px-6 py-3 rounded-xl shadow-lg"
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Habits</h1>
                            <p className="text-sm text-charcoal-500">Build consistency with compassion</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewHabit(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Habit</span>
                    </button>
                </div>
            </div>

            {/* Habits List */}
            <div className="flex-1 overflow-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-2 border-ocean-300 border-t-ocean-600 rounded-full animate-spin" />
                    </div>
                ) : habits.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-ocean-100 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-ocean-400" />
                        </div>
                        <p className="text-charcoal-500 mb-2">No habits yet</p>
                        <p className="text-sm text-charcoal-400">Start building positive routines</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {habits.map((habit) => (
                                <motion.div
                                    key={habit.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <HabitCard
                                        habit={habit}
                                        logs={habitLogs[habit.id] || []}
                                        last7Days={last7Days}
                                        today={today}
                                        isCompletedToday={isCompletedToday(habit.id)}
                                        onToggleToday={() => handleToggleToday(habit.id)}
                                        onDelete={() => handleDeleteHabit(habit.id, habit.name)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* New Habit Modal */}
            {showNewHabit && (
                <div className="fixed inset-0 bg-charcoal-900/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-window max-w-md w-full animate-scale-in">
                        <div className="p-6 border-b border-charcoal-100">
                            <h2 className="font-display text-lg font-semibold text-charcoal-800">Create a New Habit</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Habit Name</label>
                                <input
                                    type="text"
                                    value={newHabit.name}
                                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                    placeholder="e.g., Morning meditation"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Description (optional)</label>
                                <textarea
                                    value={newHabit.description}
                                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                                    placeholder="Why is this habit important?"
                                    rows={2}
                                    className="input resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Schedule</label>
                                <select
                                    value={newHabit.scheduleType}
                                    onChange={(e) => setNewHabit({ ...newHabit, scheduleType: e.target.value as HabitScheduleType })}
                                    className="input"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="custom">Flexible</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-2">Color</label>
                                <div className="flex gap-2">
                                    {habitColors.map((c) => (
                                        <button
                                            key={c.value}
                                            onClick={() => setNewHabit({ ...newHabit, color: c.value })}
                                            className={`w-8 h-8 rounded-full ${c.class} ${newHabit.color === c.value ? 'ring-2 ring-offset-2 ring-charcoal-400' : ''
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-charcoal-100 flex justify-end gap-3">
                            <button onClick={() => setShowNewHabit(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleAddHabit} className="btn-primary">
                                Create Habit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Habit Card Component
const HabitCard: React.FC<{
    habit: Habit;
    logs: { date: string; completed: boolean }[];
    last7Days: string[];
    today: string;
    isCompletedToday: boolean;
    onToggleToday: () => void;
    onDelete: () => void;
}> = ({ habit, logs, last7Days, today, isCompletedToday, onToggleToday, onDelete }) => {
    const colorClass = habitColors.find((c) => c.value === habit.color)?.class || 'bg-sage-400';

    const isCompleted = (date: string) => logs.some((l) => l.date === date && l.completed);

    // Calculate consistency (trend-based, not streak)
    const completedDays = last7Days.filter((d) => isCompleted(d)).length;
    const consistency = Math.round((completedDays / 7) * 100);

    return (
        <div className="bg-white rounded-xl border border-charcoal-100 p-4 transition-shadow hover:shadow-soft">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <div>
                        <h3 className="font-medium text-charcoal-800">{habit.name}</h3>
                        {habit.description && (
                            <p className="text-sm text-charcoal-500">{habit.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Delete Toggle */}
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-lg text-charcoal-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete Habit"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Today's Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={onToggleToday}
                        className={`
                            px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 min-w-[100px]
                            ${isCompletedToday
                                ? 'bg-gradient-to-r from-sage-500 to-sage-600 text-white shadow-md'
                                : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                            }
                        `}
                    >
                        {isCompletedToday ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Done</span>
                            </>
                        ) : (
                            <span>Check-in</span>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* 7-Day Mini Calendar */}
            <div className="flex items-center gap-1 mt-3">
                {last7Days.map((date) => {
                    const dayName = new Date(date).toLocaleDateString('en', { weekday: 'narrow' });
                    const completed = isCompleted(date);
                    const isToday = date === today;
                    return (
                        <div key={date} className="flex-1 text-center">
                            <span className={`text-xs block mb-1 ${isToday ? 'font-bold text-charcoal-700' : 'text-charcoal-400'}`}>{dayName}</span>
                            <motion.div
                                initial={false}
                                animate={completed ? {
                                    scale: [1, 1.15, 1],
                                    opacity: 1
                                } : {
                                    scale: 1,
                                    opacity: 1
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 15,
                                    duration: 0.4
                                }}
                                className={`h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${completed
                                    ? `${colorClass} shadow-sm`
                                    : 'bg-charcoal-100'
                                    } ${isToday ? 'ring-2 ring-charcoal-400 ring-offset-1' : ''}`}
                            >
                                <AnimatePresence mode="wait">
                                    {completed && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        >
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Consistency Indicator */}
            <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-charcoal-500">Past 7 days</span>
                <span className={`font-medium ${consistency >= 70 ? 'text-sage-600' : 'text-charcoal-600'}`}>
                    {consistency}% consistency
                </span>
            </div>
        </div>
    );
};
