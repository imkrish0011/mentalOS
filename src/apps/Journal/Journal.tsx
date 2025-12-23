import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Calendar, PenLine, Tag, Coffee, Smile, Frown, VenetianMask, Zap, Brain, Heart, CloudRain, BedDouble, AlertCircle, Plus, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import { createJournalEntry, getJournalEntries, deleteJournalEntry, updateJournalEntry } from '../../lib/firestoreService';
import type { JournalEntry } from '../../types';

const emotionOptions: { label: string; icon: React.ElementType }[] = [
    { label: 'Calm', icon: Coffee },
    { label: 'Happy', icon: Smile },
    { label: 'Sad', icon: Frown },
    { label: 'Frustrated', icon: VenetianMask },
    { label: 'Anxious', icon: AlertCircle },
    { label: 'Thoughtful', icon: Brain },
    { label: 'Tired', icon: BedDouble },
    { label: 'Motivated', icon: Zap },
    { label: 'Grateful', icon: Heart },
    { label: 'Overwhelmed', icon: CloudRain },
];

const promptSuggestions = [
    "What's on your mind today?",
    "What are you grateful for?",
    "What challenged you today?",
    "What did you learn about yourself?",
    "What would make today feel complete?",
    "How are you really feeling right now?",
];

export const JournalApp: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Editor state
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const displayDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        if (!user) return;
        loadEntries();
    }, [user]);

    const loadEntries = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const fetchedEntries = await getJournalEntries(user.uid, 30);
            setEntries(fetchedEntries);
        } catch (error) {
            console.error('Error loading entries:', error);
        }
        setIsLoading(false);
    };

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions((prev) =>
            prev.includes(emotion)
                ? prev.filter((e) => e !== emotion)
                : [...prev, emotion]
        );
    };

    const handleEdit = (entry: JournalEntry) => {
        setEditingEntryId(entry.id);
        setContent(entry.content);
        setSelectedEmotions(entry.emotions);
        setSelectedPrompt(entry.promptUsed || null);
        setView('editor');
    };

    const handleSave = async () => {
        if (!user || !content.trim()) return;

        setIsSaving(true);
        try {
            if (editingEntryId) {
                await updateJournalEntry(user.uid, editingEntryId, {
                    content: content.trim(),
                    emotions: selectedEmotions,
                    promptUsed: selectedPrompt || undefined,
                });
            } else {
                await createJournalEntry(user.uid, {
                    date: dateStr,
                    content: content.trim(),
                    emotions: selectedEmotions,
                    promptUsed: selectedPrompt || undefined,
                });
            }

            // Reset editor and go back to list
            setContent('');
            setSelectedEmotions([]);
            setSelectedPrompt(null);
            setEditingEntryId(null);
            setView('list');

            // Reload entries
            await loadEntries();
        } catch (err) {
            console.error('Error saving entry:', err);
        }
        setIsSaving(false);
    };

    const openEditor = () => {
        setContent('');
        setSelectedEmotions([]);
        setSelectedPrompt(null);
        setEditingEntryId(null);
        setView('editor');
    };

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {view === 'editor' && (
                            <button
                                onClick={() => setView('list')}
                                className="p-2 hover:bg-charcoal-50 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-charcoal-600" />
                            </button>
                        )}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-500 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Journal</h1>
                            <p className="text-sm text-charcoal-500">
                                {view === 'list' ? 'Your reflections' : (editingEntryId ? 'Edit entry' : 'New entry')}
                            </p>
                        </div>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={openEditor}
                            className="flex items-center gap-2 px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Entry</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {view === 'list' ? (
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-2 border-terracotta-300 border-t-terracotta-600 rounded-full animate-spin" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-terracotta-100 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-terracotta-400" />
                            </div>
                            <p className="text-charcoal-500 mb-2">No journal entries yet</p>
                            <p className="text-sm text-charcoal-400">Start writing to capture your thoughts</p>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto space-y-4">
                            {entries.map((entry) => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    userId={user?.uid || ''}
                                    onDelete={loadEntries}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Date Display */}
                        <div className="flex items-center gap-2 text-charcoal-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{displayDate}</span>
                        </div>

                        {/* Prompts */}
                        <div>
                            <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-2">
                                <PenLine className="w-4 h-4" />
                                <span>Need a prompt?</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {promptSuggestions.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => {
                                            setSelectedPrompt(prompt);
                                            if (!content) setContent(prompt + '\n\n');
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedPrompt === prompt
                                            ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                                            : 'bg-white border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50'
                                            }`}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Writing Area */}
                        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write freely... this is your private space."
                                className="w-full h-64 p-4 text-charcoal-800 placeholder-charcoal-400 resize-none focus:outline-none"
                                style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                            />
                        </div>

                        {/* Emotion Tags */}
                        <div>
                            <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-2">
                                <Tag className="w-4 h-4" />
                                <span>How are you feeling?</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {emotionOptions.map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => toggleEmotion(option.label)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${selectedEmotions.includes(option.label)
                                            ? 'bg-sage-100 text-sage-700 border border-sage-200'
                                            : 'bg-white border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50'
                                            }`}
                                    >
                                        <option.icon className="w-3 h-3" />
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center justify-between pt-4">
                            <span className="text-sm text-charcoal-400">
                                {content.length} characters
                            </span>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !content.trim()}
                                className="px-6 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : (editingEntryId ? 'Update Entry' : 'Save Entry')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Entry Card Component
const EntryCard: React.FC<{ entry: JournalEntry; userId: string; onDelete: () => void; onEdit: (entry: JournalEntry) => void }> = ({ entry, userId, onDelete, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const entryDate = new Date(entry.date);
    const displayDate = entryDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const preview = entry.content.slice(0, 150) + (entry.content.length > 150 ? '...' : '');

    const handleDelete = async () => {
        if (!userId || !entry.id) return;
        setIsDeleting(true);
        try {
            await deleteJournalEntry(userId, entry.id);
            onDelete();
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
        setIsDeleting(false);
        setShowConfirm(false);
    };

    return (
        <div className="bg-white rounded-xl border border-charcoal-100 p-5 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-charcoal-500">{displayDate}</div>
                <div className="flex items-center gap-2">
                    {entry.emotions.length > 0 && (
                        <div className="flex gap-1">
                            {entry.emotions.slice(0, 3).map((emotion) => (
                                <span
                                    key={emotion}
                                    className="px-2 py-0.5 bg-sage-100 text-sage-700 text-xs rounded-full"
                                >
                                    {emotion}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Edit Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(entry);
                        }}
                        className="p-1.5 text-charcoal-400 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors"
                        title="Edit entry"
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
                            title="Delete entry"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                                disabled={isDeleting}
                                className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowConfirm(false);
                                }}
                                className="px-2 py-1 text-xs bg-charcoal-100 hover:bg-charcoal-200 text-charcoal-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-charcoal-700 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                {preview}
            </p>
        </div>
    );
};
