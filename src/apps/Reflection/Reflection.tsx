import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RefreshCw, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Lightbulb, Heart, ArrowLeft } from 'lucide-react';
import { createReflection, getReflections, deleteReflection, updateReflection, type Reflection } from '../../lib/firestoreService';
import { useToastStore } from '../../stores/toastStore';
import { DeleteConfirmModal } from '../../components/UI/DeleteConfirmModal';

export const ReflectionApp: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToastStore();
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [wins, setWins] = useState<string[]>(['']);
    const [challenges, setChallenges] = useState<string[]>(['']);
    const [lessons, setLessons] = useState<string[]>(['']);
    const [gratitude, setGratitude] = useState<string[]>(['']);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadReflections();
    }, [user]);

    const loadReflections = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getReflections(user.uid);
            setReflections(data);
        } catch (error) {
            console.error('Error loading reflections:', error);
            showToast('Failed to load reflections', 'error');
        }
        setIsLoading(false);
    };

    const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, '']);
    };

    const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prev => {
            const newArray = [...prev];
            newArray[index] = value;
            return newArray;
        });
    };

    const handleEdit = (reflection: Reflection) => {
        setEditingId(reflection.id);
        setWins(reflection.wins.length ? reflection.wins : ['']);
        setChallenges(reflection.challenges.length ? reflection.challenges : ['']);
        setLessons(reflection.lessons.length ? reflection.lessons : ['']);
        setGratitude(reflection.gratitude.length ? reflection.gratitude : ['']);
        setView('editor');
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const reflectionData = {
                wins: wins.filter(w => w.trim()),
                challenges: challenges.filter(c => c.trim()),
                lessons: lessons.filter(l => l.trim()),
                gratitude: gratitude.filter(g => g.trim()),
            };

            if (editingId) {
                await updateReflection(user.uid, editingId, reflectionData);
                showToast('Reflection updated!');
            } else {
                await createReflection(user.uid, {
                    date: new Date().toLocaleDateString(),
                    ...reflectionData
                });
                showToast('Reflection saved!');
            }

            resetForm();
            await loadReflections();
        } catch (error) {
            console.error('Error saving reflection:', error);
            showToast('Failed to save reflection', 'error');
        }
        setIsSaving(false);
    };

    const confirmDelete = async () => {
        if (!user || !deleteId) return;

        try {
            const id = deleteId;
            setDeleteId(null);
            await deleteReflection(user.uid, id);
            showToast('Reflection deleted');
            await loadReflections();
        } catch (error) {
            console.error('Error deleting reflection:', error);
            showToast('Failed to delete reflection', 'error');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setWins(['']);
        setChallenges(['']);
        setLessons(['']);
        setGratitude(['']);
        setView('list');
    };

    const openNew = () => {
        resetForm();
        setView('editor');
    };

    return (
        <div className="h-full flex flex-col bg-cream-50">
            <DeleteConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Reflection"
                message="Are you sure you want to delete this reflection? This action cannot be undone."
            />

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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Reflection</h1>
                            <p className="text-sm text-charcoal-500">
                                {view === 'list' ? 'Weekly review & insights' : (editingId ? 'Edit Reflection' : 'New Reflection')}
                            </p>
                        </div>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={openNew}
                            className="bg-charcoal-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-charcoal-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Reflection
                        </button>
                    )}
                </div>
            </div>

            {/* List View */}
            {view === 'list' && (
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        </div>
                    ) : reflections.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 text-purple-400" />
                            </div>
                            <p className="text-charcoal-500 mb-2">No reflections yet</p>
                            <p className="text-sm text-charcoal-400">Start your weekly review practice</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {reflections.map(r => (
                                <div key={r.id} className="bg-white p-6 rounded-xl border border-charcoal-100 hover:shadow-sm transition-shadow relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(r)}
                                            className="p-2 text-charcoal-300 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteId(r.id);
                                            }}
                                            className="p-2 text-charcoal-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="text-sm text-charcoal-500 mb-6 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                        {r.date}
                                    </div>

                                    <div className="grid gap-6">
                                        {r.wins.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-sage-700">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <h4 className="font-medium text-sm">Wins</h4>
                                                </div>
                                                <ul className="space-y-1.5 ml-6">
                                                    {r.wins.map((w, i) => <li key={i} className="text-sm text-charcoal-700 list-disc">{w}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {r.challenges.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-orange-700">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <h4 className="font-medium text-sm">Challenges</h4>
                                                </div>
                                                <ul className="space-y-1.5 ml-6">
                                                    {r.challenges.map((c, i) => <li key={i} className="text-sm text-charcoal-700 list-disc">{c}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {r.lessons.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-ocean-700">
                                                    <Lightbulb className="w-4 h-4" />
                                                    <h4 className="font-medium text-sm">Lessons</h4>
                                                </div>
                                                <ul className="space-y-1.5 ml-6">
                                                    {r.lessons.map((l, i) => <li key={i} className="text-sm text-charcoal-700 list-disc">{l}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {r.gratitude.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-pink-700">
                                                    <Heart className="w-4 h-4" />
                                                    <h4 className="font-medium text-sm">Gratitude</h4>
                                                </div>
                                                <ul className="space-y-1.5 ml-6">
                                                    {r.gratitude.map((g, i) => <li key={i} className="text-sm text-charcoal-700 list-disc">{g}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Editor View */}
            {view === 'editor' && (
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-xl mx-auto space-y-8 pb-10">
                        {/* Wins */}
                        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-sage-700">
                                <CheckCircle2 className="w-5 h-5" />
                                <label className="font-medium">Wins this week</label>
                            </div>
                            {wins.map((win, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    value={win}
                                    onChange={e => handleFieldChange(setWins, i, e.target.value)}
                                    className="w-full mb-3 px-4 py-3 rounded-xl bg-sage-50 border-transparent focus:bg-white focus:border-sage-300 focus:ring-0 transition-all outline-none text-charcoal-800 placeholder-sage-300"
                                    placeholder="What went well?"
                                />
                            ))}
                            <button onClick={() => handleAddField(setWins)} className="text-sm text-sage-600 font-medium hover:text-sage-700 flex items-center gap-1 mt-2">
                                <Plus className="w-3 h-3" /> Add win
                            </button>
                        </div>

                        {/* Challenges */}
                        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-orange-700">
                                <AlertTriangle className="w-5 h-5" />
                                <label className="font-medium">Challenges faced</label>
                            </div>
                            {challenges.map((challenge, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    value={challenge}
                                    onChange={e => handleFieldChange(setChallenges, i, e.target.value)}
                                    className="w-full mb-3 px-4 py-3 rounded-xl bg-orange-50 border-transparent focus:bg-white focus:border-orange-300 focus:ring-0 transition-all outline-none text-charcoal-800 placeholder-orange-300"
                                    placeholder="What was difficult?"
                                />
                            ))}
                            <button onClick={() => handleAddField(setChallenges)} className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 mt-2">
                                <Plus className="w-3 h-3" /> Add challenge
                            </button>
                        </div>

                        {/* Lessons */}
                        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-ocean-700">
                                <Lightbulb className="w-5 h-5" />
                                <label className="font-medium">Lessons learned</label>
                            </div>
                            {lessons.map((lesson, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    value={lesson}
                                    onChange={e => handleFieldChange(setLessons, i, e.target.value)}
                                    className="w-full mb-3 px-4 py-3 rounded-xl bg-ocean-50 border-transparent focus:bg-white focus:border-ocean-300 focus:ring-0 transition-all outline-none text-charcoal-800 placeholder-ocean-300"
                                    placeholder="What did you learn?"
                                />
                            ))}
                            <button onClick={() => handleAddField(setLessons)} className="text-sm text-ocean-600 font-medium hover:text-ocean-700 flex items-center gap-1 mt-2">
                                <Plus className="w-3 h-3" /> Add lesson
                            </button>
                        </div>

                        {/* Gratitude */}
                        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-pink-700">
                                <Heart className="w-5 h-5" />
                                <label className="font-medium">Grateful for</label>
                            </div>
                            {gratitude.map((item, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    value={item}
                                    onChange={e => handleFieldChange(setGratitude, i, e.target.value)}
                                    className="w-full mb-3 px-4 py-3 rounded-xl bg-pink-50 border-transparent focus:bg-white focus:border-pink-300 focus:ring-0 transition-all outline-none text-charcoal-800 placeholder-pink-300"
                                    placeholder="What are you thankful for?"
                                />
                            ))}
                            <button onClick={() => handleAddField(setGratitude)} className="text-sm text-pink-600 font-medium hover:text-pink-700 flex items-center gap-1 mt-2">
                                <Plus className="w-3 h-3" /> Add gratitude
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={() => setView('list')}
                                className="flex-1 py-3 text-charcoal-600 font-medium hover:bg-charcoal-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-charcoal-800 text-white font-medium hover:bg-charcoal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : (editingId ? 'Update Reflection' : 'Save Reflection')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
