import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Heart, Zap, Brain, CloudRain, Cloud, Minus, Sun, Sparkles, Plus, ArrowLeft, Calendar, Edit2, Trash2 } from 'lucide-react';
import { logMood, getMoodLogs, updateMoodLog, deleteMoodLog } from '../../lib/firestoreService';
import { Timestamp } from 'firebase/firestore';
import type { MoodScale, MoodLog } from '../../types';

const moodLevels: { value: MoodScale; icon: React.ElementType; label: string; color: string }[] = [
    { value: 1, icon: CloudRain, label: 'Struggling', color: 'bg-red-100 border-red-200 text-red-600' },
    { value: 2, icon: Cloud, label: 'Difficult', color: 'bg-orange-100 border-orange-200 text-orange-600' },
    { value: 3, icon: Minus, label: 'Neutral', color: 'bg-yellow-100 border-yellow-200 text-yellow-600' },
    { value: 4, icon: Sun, label: 'Good', color: 'bg-lime-100 border-lime-200 text-lime-600' },
    { value: 5, icon: Sparkles, label: 'Great', color: 'bg-green-100 border-green-200 text-green-600' },
];

const emotionLabels = [
    'Peaceful', 'Anxious', 'Hopeful', 'Frustrated',
    'Content', 'Overwhelmed', 'Energized', 'Exhausted',
    'Grateful', 'Lonely', 'Inspired', 'Uncertain'
];

export const MoodApp: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [selectedLog, setSelectedLog] = useState<MoodLog | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // New/Edit entry state
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [selectedMood, setSelectedMood] = useState<MoodScale | null>(null);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [energy, setEnergy] = useState<MoodScale | null>(null);
    const [stress, setStress] = useState<MoodScale | null>(null);
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    useEffect(() => {
        if (!user) return;
        loadLogs();
    }, [user]);

    const loadLogs = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const fetchedLogs = await getMoodLogs(user.uid, 30);
            setLogs(fetchedLogs);
        } catch (error) {
            console.error('Error loading mood logs:', error);
        }
        setIsLoading(false);
    };

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions((prev) =>
            prev.includes(emotion)
                ? prev.filter((e) => e !== emotion)
                : prev.length < 3 ? [...prev, emotion] : prev
        );
    };

    const handleEdit = (log: MoodLog) => {
        setEditingLogId(log.id);
        setSelectedMood(log.mood);
        setSelectedEmotions(log.emotions);
        setEnergy(log.energy || null);
        setStress(log.stress || null);
        setNote(log.note || '');
        setView('new'); // Reuse 'new' view for editing
    };

    const handleSave = async () => {
        if (!user || !selectedMood) return;

        setIsSaving(true);
        try {
            const moodData = {
                mood: selectedMood,
                emotions: selectedEmotions,
                ...(energy ? { energy } : {}),
                ...(stress ? { stress } : {}),
                ...(note.trim() ? { note: note.trim() } : {}),
            };

            if (editingLogId) {
                await updateMoodLog(user.uid, editingLogId, moodData);
            } else {
                await logMood(user.uid, {
                    ...moodData,
                    date: dateStr,
                    timestamp: Timestamp.now(),
                });
            }

            // Reset and go back to list
            setSelectedMood(null);
            setSelectedEmotions([]);
            setEnergy(null);
            setStress(null);
            setNote('');
            setEditingLogId(null);
            setView('list');

            // Reload logs
            await loadLogs();
        } catch (err) {
            console.error('Error logging mood:', err);
        }
        setIsSaving(false);
    };

    const openNew = () => {
        setEditingLogId(null);
        setSelectedMood(null);
        setSelectedEmotions([]);
        setEnergy(null);
        setStress(null);
        setNote('');
        setView('new');
    };

    const viewDetail = (log: MoodLog) => {
        setSelectedLog(log);
        setView('detail');
    };

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {(view === 'new' || view === 'detail') && (
                            <button
                                onClick={() => setView('list')}
                                className="p-2 hover:bg-charcoal-50 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-charcoal-600" />
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Mood</h1>
                            <p className="text-sm text-charcoal-500">
                                {view === 'list' ? 'Track your emotional state' : (editingLogId ? 'Edit mood log' : 'Log current mood')}
                            </p>
                        </div>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={openNew}
                            className="flex items-center gap-2 px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Log Mood</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {view === 'list' ? (
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-2xl flex items-center justify-center">
                                <Heart className="w-8 h-8 text-pink-400" />
                            </div>
                            <p className="text-charcoal-500 mb-2">No mood logs yet</p>
                            <p className="text-sm text-charcoal-400">Start tracking your emotional patterns</p>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto space-y-4">
                            {logs.map((log) => (
                                <MoodCard
                                    key={log.id}
                                    log={log}
                                    userId={user?.uid || ''}
                                    onClick={() => viewDetail(log)}
                                    onEdit={() => handleEdit(log)}
                                    onDelete={loadLogs}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : view === 'detail' && selectedLog ? (
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-2xl mx-auto">
                        <MoodDetail log={selectedLog} />
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Mood Selection */}
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-3">How are you feeling?</label>
                            <div className="grid grid-cols-5 gap-2">
                                {moodLevels.map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => setSelectedMood(level.value)}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedMood === level.value
                                            ? level.color + ' scale-105'
                                            : 'bg-white border-charcoal-200 hover:border-charcoal-300'
                                            }`}
                                    >
                                        <level.icon className={`w-6 h-6 mx-auto mb-1 ${selectedMood === level.value ? '' : 'text-charcoal-400'}`} />
                                        <p className={`text-xs ${selectedMood === level.value ? '' : 'text-charcoal-500'}`}>{level.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Emotion Tags */}
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-3">Select up to 3 emotions</label>
                            <div className="flex flex-wrap gap-2">
                                {emotionLabels.map((emotion) => (
                                    <button
                                        key={emotion}
                                        onClick={() => toggleEmotion(emotion)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedEmotions.includes(emotion)
                                            ? 'bg-sage-100 text-sage-700 border border-sage-200'
                                            : 'bg-white border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50'
                                            }`}
                                    >
                                        {emotion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Energy & Stress */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-2">Energy</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setEnergy(level as MoodScale)}
                                            className={`flex-1 h-8 rounded ${energy && level <= energy ? 'bg-ocean-400' : 'bg-charcoal-100'
                                                } transition-colors`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-2">Stress</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setStress(level as MoodScale)}
                                            className={`flex-1 h-8 rounded ${stress && level <= stress ? 'bg-terracotta-400' : 'bg-charcoal-100'
                                                } transition-colors`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">Note (optional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="What's contributing to this mood?"
                                className="w-full h-24 p-3 rounded-xl border border-charcoal-200 focus:border-charcoal-400 focus:ring-0 outline-none resize-none"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !selectedMood}
                            className="w-full py-3 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : (editingLogId ? 'Update Mood Log' : 'Save Mood Log')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Mood Card Component
const MoodCard: React.FC<{ log: MoodLog; userId: string; onClick: () => void; onEdit: () => void; onDelete: () => void }> = ({ log, userId, onClick, onEdit, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const logDate = new Date(log.date);
    const displayDate = logDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const moodLevel = moodLevels.find(m => m.value === log.mood);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userId || !log.id) return;
        setIsDeleting(true);
        try {
            await deleteMoodLog(userId, log.id);
            onDelete();
        } catch (error) {
            console.error('Error deleting mood log:', error);
        }
        setIsDeleting(false);
        setShowConfirm(false);
    };

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-charcoal-100 p-5 hover:shadow-sm transition-shadow cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-charcoal-500">{displayDate}</div>
                <div className="flex items-center gap-2">
                    {moodLevel && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${moodLevel.color}`}>
                            <moodLevel.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{moodLevel.label}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-1.5 text-charcoal-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors"
                            title="Edit log"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        {!showConfirm ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowConfirm(true);
                                }}
                                className="p-1.5 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete log"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? '...' : 'Del'}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirm(false);
                                    }}
                                    className="px-2 py-1 text-xs bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-600 rounded-lg transition-colors"
                                >
                                    X
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {log.emotions.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {log.emotions.map((emotion) => (
                        <span
                            key={emotion}
                            className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs rounded-full"
                        >
                            {emotion}
                        </span>
                    ))}
                </div>
            )}
            {log.note && (
                <p className="text-sm text-charcoal-600 mt-2 line-clamp-2">{log.note}</p>
            )}
        </div>
    );
};

// Mood Detail Component
const MoodDetail: React.FC<{ log: MoodLog }> = ({ log }) => {
    const logDate = new Date(log.date);
    const displayDate = logDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const moodLevel = moodLevels.find(m => m.value === log.mood);

    return (
        <div className="space-y-6">
            {/* Date */}
            <div className="flex items-center gap-2 text-charcoal-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{displayDate}</span>
            </div>

            {/* Mood */}
            <div>
                <h3 className="text-sm font-medium text-charcoal-700 mb-3">Mood</h3>
                {moodLevel && (
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl ${moodLevel.color}`}>
                        <moodLevel.icon className="w-6 h-6" />
                        <span className="text-lg font-medium">{moodLevel.label}</span>
                    </div>
                )}
            </div>

            {/* Emotions */}
            {log.emotions.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-charcoal-700 mb-3">Emotions</h3>
                    <div className="flex gap-2 flex-wrap">
                        {log.emotions.map((emotion) => (
                            <span
                                key={emotion}
                                className="px-4 py-2 bg-sage-100 text-sage-700 text-sm rounded-full font-medium"
                            >
                                {emotion}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Energy & Stress */}
            <div className="grid grid-cols-2 gap-4">
                {log.energy && (
                    <div>
                        <h3 className="text-sm font-medium text-charcoal-700 mb-2">Energy</h3>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`flex-1 h-8 rounded ${level <= log.energy! ? 'bg-ocean-400' : 'bg-charcoal-100'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {log.stress && (
                    <div>
                        <h3 className="text-sm font-medium text-charcoal-700 mb-2">Stress</h3>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`flex-1 h-8 rounded ${level <= log.stress! ? 'bg-terracotta-400' : 'bg-charcoal-100'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Note */}
            {log.note && (
                <div>
                    <h3 className="text-sm font-medium text-charcoal-700 mb-2">Note</h3>
                    <div className="bg-white rounded-xl border border-charcoal-100 p-4">
                        <p className="text-charcoal-700 leading-relaxed">{log.note}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
