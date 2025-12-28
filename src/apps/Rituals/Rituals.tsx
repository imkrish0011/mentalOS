import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRitualsStore } from '../../stores/ritualsStore';
import { useHabitsStore } from '../../stores/habitsStore';
import { Play, Plus, Trash2, Clock, Edit2, Check, X, Layers, List } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/UI/DeleteConfirmModal';
import { RitualPlayer } from './RitualPlayer';
import type { Ritual, RitualStep } from '../../types';

export const RitualsApp: React.FC = () => {
    const { user } = useAuth();
    const { rituals, isLoading, fetchRituals, addRitual, editRitual, deleteRitual, activeRitualId, setActiveRitualId } = useRitualsStore();
    const { habits, fetchHabits } = useHabitsStore();

    // UI State
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<RitualStep[]>([]);

    // Step Form State
    const [stepTitle, setStepTitle] = useState('');
    const [stepDuration, setStepDuration] = useState(5);
    const [selectedHabitId, setSelectedHabitId] = useState<string>('');

    useEffect(() => {
        if (!user) return;
        fetchRituals(user.uid);
        fetchHabits(user.uid);
    }, [user]);

    const handleStartEdit = (ritual: Ritual) => {
        setEditingId(ritual.id);
        setTitle(ritual.title);
        setDescription(ritual.description);
        setSteps(ritual.steps);
        setIsCreating(true);
    };

    const handleCancelEdit = () => {
        setIsCreating(false);
        setEditingId(null);
        setTitle('');
        setDescription('');
        setSteps([]);
        setStepTitle('');
        setSelectedHabitId('');
    };

    const handleAddStep = () => {
        if ((!stepTitle && !selectedHabitId) || stepDuration <= 0) return;

        let finalTitle = stepTitle;
        if (!finalTitle && selectedHabitId) {
            const habit = habits.find(h => h.id === selectedHabitId);
            if (habit) finalTitle = habit.name;
        }

        const newStep: RitualStep = {
            id: Math.random().toString(36).substr(2, 9),
            title: finalTitle,
            duration: stepDuration,
        };
        if (selectedHabitId) {
            newStep.habitId = selectedHabitId;
        }

        setSteps([...steps, newStep]);
        setStepTitle('');
        setSelectedHabitId('');
        // Keep duration same for easy entry or reset? Resetting to 5.
        setStepDuration(5);
    };

    const handleRemoveStep = (stepId: string) => {
        setSteps(steps.filter(s => s.id !== stepId));
    };

    const handleSave = async () => {
        if (!user || !title.trim() || steps.length === 0) return;

        // Sanitize steps to remove undefined values
        const sanitizedSteps = steps.map(step => {
            const s = { ...step };
            // Ensure no undefined values are passed to Firestore
            if (s.habitId === undefined) delete s.habitId;
            return s;
        });

        const ritualData = {
            title,
            description,
            steps: sanitizedSteps
        };

        if (editingId) {
            await editRitual(user.uid, editingId, ritualData);
        } else {
            await addRitual(user.uid, ritualData);
        }

        handleCancelEdit();
    };

    const handlePlayComplete = () => {
        setActiveRitualId(null);
        // Could enable a confetti trigger here or log a completion
    };

    const activeRitual = rituals.find(r => r.id === activeRitualId);

    // Calculate total duration for a ritual
    const getTotalDuration = (r: Ritual) => r.steps.reduce((acc, s) => acc + s.duration, 0);

    return (
        <div className="h-full flex flex-col bg-cream-50 relative">
            {/* Player Overlay */}
            {activeRitual && (
                <RitualPlayer
                    ritual={activeRitual}
                    onClose={() => setActiveRitualId(null)}
                    onComplete={handlePlayComplete}
                />
            )}

            <DeleteConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={async () => {
                    if (user && deleteId) {
                        await deleteRitual(user.uid, deleteId);
                        setDeleteId(null);
                    }
                }}
                title="Delete Ritual"
                message="Are you sure you want to delete this ritual? This cannot be undone."
            />

            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Rituals</h1>
                            <p className="text-sm text-charcoal-500">Design your perfect days</p>
                        </div>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Ritual
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {isCreating ? (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-charcoal-100 p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-charcoal-800">
                                {editingId ? 'Edit Ritual' : 'Create Ritual'}
                            </h2>
                            <button onClick={handleCancelEdit} className="text-charcoal-400 hover:text-charcoal-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">Ritual Name</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g., Morning Glory"
                                    className="w-full text-lg p-2 border-b border-charcoal-200 focus:border-indigo-500 outline-none bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="What is this ritual for?"
                                    className="w-full text-sm p-2 border-b border-charcoal-200 focus:border-indigo-500 outline-none bg-transparent resize-none h-16"
                                />
                            </div>
                        </div>

                        {/* Steps Builder */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-charcoal-700 mb-3 flex items-center gap-2">
                                <List className="w-4 h-4" />
                                Sequence
                            </h3>

                            {/* Steps List */}
                            <div className="space-y-2 mb-4">
                                {steps.map((step, idx) => (
                                    <div key={step.id} className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg group">
                                        <div className="w-6 h-6 rounded-full bg-white border border-charcoal-200 flex items-center justify-center text-xs font-medium text-charcoal-400">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-charcoal-800">{step.title}</div>
                                            <div className="text-xs text-charcoal-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {step.duration} min
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveStep(step.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {steps.length === 0 && (
                                    <div className="text-center py-4 text-charcoal-400 text-sm border-2 border-dashed border-charcoal-100 rounded-lg">
                                        No steps added yet.
                                    </div>
                                )}
                            </div>

                            {/* Add Step Form */}
                            <div className="bg-charcoal-50 p-4 rounded-xl border border-charcoal-100">
                                <div className="text-xs font-semibold text-charcoal-500 uppercase mb-3">Add Step</div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <select
                                                value={selectedHabitId}
                                                onChange={e => {
                                                    setSelectedHabitId(e.target.value);
                                                    if (e.target.value) setStepTitle(''); // Clear manual title if habit selected
                                                }}
                                                className="w-full p-2 text-sm rounded-lg border border-charcoal-200"
                                            >
                                                <option value="">-- Select a Habit (Optional) --</option>
                                                {habits.map(h => (
                                                    <option key={h.id} value={h.id}>{h.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <span className="text-sm text-charcoal-400 pt-2">OR</span>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={stepTitle}
                                                onChange={e => {
                                                    setStepTitle(e.target.value);
                                                    if (e.target.value) setSelectedHabitId(''); // Clear habit if manual title
                                                }}
                                                placeholder="Custom Task Name"
                                                className="w-full p-2 text-sm rounded-lg border border-charcoal-200"
                                                disabled={!!selectedHabitId}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-32">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={stepDuration}
                                                    onChange={e => setStepDuration(parseInt(e.target.value) || 0)}
                                                    className="w-full p-2 pl-8 text-sm rounded-lg border border-charcoal-200"
                                                />
                                                <Clock className="w-4 h-4 text-charcoal-400 absolute left-2 top-2.5" />
                                            </div>
                                        </div>
                                        <span className="text-sm text-charcoal-500">minutes</span>
                                        <button
                                            onClick={handleAddStep}
                                            disabled={(!stepTitle && !selectedHabitId) || stepDuration <= 0}
                                            className="ml-auto px-4 py-2 bg-charcoal-800 text-white text-sm font-medium rounded-lg hover:bg-charcoal-700 disabled:opacity-50"
                                        >
                                            Add Step
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-sm font-medium text-charcoal-600 hover:bg-charcoal-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!title || steps.length === 0}
                                className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                            >
                                Save Ritual
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rituals.map(ritual => (
                            <div key={ritual.id} className="bg-white rounded-2xl border border-charcoal-100 p-6 hover:shadow-lg transition-all duration-300 group relative">
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleStartEdit(ritual); }}
                                        className="p-1.5 text-charcoal-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteId(ritual.id); }}
                                        className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-display font-bold text-xl text-charcoal-800 mb-1">{ritual.title}</h3>
                                    <p className="text-sm text-charcoal-500 line-clamp-2 h-10">{ritual.description}</p>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-charcoal-500 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-indigo-400" />
                                        <span>{ritual.steps.length} Steps</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        <span>{getTotalDuration(ritual)} min</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setActiveRitualId(ritual.id)}
                                    className="w-full py-3 bg-charcoal-50 hover:bg-indigo-600 hover:text-white text-charcoal-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group/btn"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Start Ritual
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
