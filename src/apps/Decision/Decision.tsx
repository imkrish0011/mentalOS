import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Scale, Plus, Trash2, Check, ArrowLeft, Loader2, Calendar, Edit2 } from 'lucide-react';
import { createDecision, getDecisions, updateDecision, deleteDecision, type Decision } from '../../lib/firestoreService';
import { useToastStore } from '../../stores/toastStore';
import { DeleteConfirmModal } from '../../components/UI/DeleteConfirmModal';

export const DecisionApp: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToastStore();
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [isLoading, setIsLoading] = useState(true);

    // Form/Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [context, setContext] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadDecisions();
    }, [user]);

    const loadDecisions = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getDecisions(user.uid);
            setDecisions(data);
        } catch (error) {
            console.error('Error loading decisions:', error);
            showToast('Failed to load decisions', 'error');
        }
        setIsLoading(false);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleOptionChange = (idx: number, value: string) => {
        const newOptions = [...options];
        newOptions[idx] = value;
        setOptions(newOptions);
    };

    const handleDeleteOption = (idxToRemove: number) => {
        const newOptions = options.filter((_, idx) => idx !== idxToRemove);
        setOptions(newOptions);
        if (selectedOptionIdx === idxToRemove) setSelectedOptionIdx(null);
        else if (selectedOptionIdx !== null && idxToRemove < selectedOptionIdx) setSelectedOptionIdx(selectedOptionIdx - 1);
    };

    const handleChooseOption = async (decision: Decision, optionName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;

        const newChoice = decision.chosen === optionName ? undefined : optionName;

        try {
            setDecisions(prev => prev.map(d =>
                d.id === decision.id ? { ...d, chosen: newChoice } : d
            ));

            await updateDecision(user.uid, decision.id, { chosen: newChoice });
        } catch (error) {
            console.error('Error updating decision:', error);
            showToast('Failed to update choice', 'error');
            loadDecisions();
        }
    };

    const handleEdit = (decision: Decision) => {
        setEditingId(decision.id);
        setTitle(decision.title);
        setContext(decision.context);
        const opts = decision.options.map(o => o.name);
        setOptions(opts.length ? opts : ['', '']);

        if (decision.chosen) {
            const idx = opts.indexOf(decision.chosen);
            setSelectedOptionIdx(idx >= 0 ? idx : null);
        } else {
            setSelectedOptionIdx(null);
        }

        setView('editor');
    };

    const confirmDelete = async () => {
        if (!user || !deleteId) return;

        try {
            const id = deleteId;
            setDeleteId(null);
            await deleteDecision(user.uid, id);
            setDecisions(prev => prev.filter(d => d.id !== id));
            showToast('Decision deleted');
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('Failed to delete', 'error');
        }
    };

    const handleSave = async () => {
        if (!user || !title.trim()) return;

        setIsSaving(true);
        try {
            const finalOptions = options
                .filter(o => o.trim())
                .map(name => ({ name, pros: [], cons: [] }));

            let finalSelectedOption = undefined;
            if (selectedOptionIdx !== null && options[selectedOptionIdx].trim()) {
                finalSelectedOption = options[selectedOptionIdx];
            }

            const decisionData = {
                title,
                context,
                options: finalOptions,
                ...(finalSelectedOption ? { chosen: finalSelectedOption } : {}),
            };

            if (editingId) {
                await updateDecision(user.uid, editingId, decisionData);
                showToast('Decision updated');
            } else {
                await createDecision(user.uid, decisionData);
                showToast('Decision logged');
            }

            resetForm();
            await loadDecisions();
        } catch (error) {
            console.error('Error saving decision:', error);
            showToast('Failed to save decision', 'error');
        }
        setIsSaving(false);
    };

    const resetForm = () => {
        setTitle('');
        setContext('');
        setOptions(['', '']);
        setSelectedOptionIdx(null);
        setEditingId(null);
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
                title="Delete Decision"
                message="Are you sure you want to delete this decision record?"
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal-700 to-charcoal-900 flex items-center justify-center">
                            <Scale className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Decisions</h1>
                            <p className="text-sm text-charcoal-500">
                                {view === 'list' ? 'Principles over preferences' : (editingId ? 'Edit Decision' : 'Log Decision')}
                            </p>
                        </div>
                    </div>
                    {view === 'list' && (
                        <button
                            onClick={openNew}
                            className="bg-charcoal-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-charcoal-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Log Decision
                        </button>
                    )}
                </div>
            </div>

            {/* List View */}
            {view === 'list' && (
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="w-8 h-8 text-charcoal-400 animate-spin" />
                        </div>
                    ) : decisions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 bg-charcoal-100 rounded-2xl flex items-center justify-center">
                                <Scale className="w-8 h-8 text-charcoal-400" />
                            </div>
                            <p className="text-charcoal-500 mb-2">No decisions logged</p>
                            <p className="text-sm text-charcoal-400">Track your choices to improve judgment</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-2xl mx-auto">
                            {decisions.map(d => (
                                <div
                                    key={d.id}
                                    className="bg-white p-5 rounded-xl border border-charcoal-100 hover:shadow-sm transition-shadow group relative"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="pr-2">
                                            <h3 className="font-medium text-charcoal-800">{d.title}</h3>
                                            <span className="text-xs text-charcoal-400 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {typeof d.createdAt?.toDate === 'function' ? d.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(d)}
                                                className="p-1.5 text-charcoal-300 hover:text-ocean-500 hover:bg-ocean-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteId(d.id);
                                                }}
                                                className="p-1.5 text-charcoal-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-charcoal-600 line-clamp-2 mb-4">{d.context}</p>

                                    <div className="flex flex-wrap gap-2">
                                        {d.options.map((opt, i) => {
                                            const isSelected = opt.name === d.chosen;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={(e) => handleChooseOption(d, opt.name, e)}
                                                    className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-all ${isSelected
                                                        ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                                                        : 'bg-white text-charcoal-600 border-charcoal-100 hover:border-charcoal-300 hover:bg-charcoal-50'
                                                        }`}
                                                >
                                                    {isSelected ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-charcoal-300" />}
                                                    {opt.name}
                                                </button>
                                            );
                                        })}
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
                    <div className="max-w-xl mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">What's the decision?</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-charcoal-400 focus:ring-0 outline-none transition-colors"
                                placeholder="e.g., Should I relocate for this job?"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">Context & Factors</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-charcoal-400 focus:ring-0 outline-none transition-colors h-32 resize-none"
                                placeholder="What are the variables? What's at stake?"
                                value={context}
                                onChange={e => setContext(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-2">
                                Options Considered
                                <span className="text-charcoal-400 font-normal ml-2 text-xs">(Select to mark as chosen)</span>
                            </label>
                            <div className="space-y-3">
                                {options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="selectedOption"
                                            checked={selectedOptionIdx === idx}
                                            onChange={() => setSelectedOptionIdx(idx)}
                                            className="w-4 h-4 text-charcoal-800 cursor-pointer accent-charcoal-800"
                                        />

                                        <input
                                            type="text"
                                            className="flex-1 px-4 py-2 rounded-xl border border-charcoal-200 focus:border-charcoal-400 focus:ring-0 outline-none transition-colors text-sm"
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, e.target.value)}
                                        />

                                        <button
                                            onClick={() => handleDeleteOption(idx)}
                                            className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove option"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddOption}
                                    className="text-sm text-sage-600 font-medium hover:text-sage-700 flex items-center gap-1 mt-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Add Option
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
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
                                {isSaving ? 'Saving...' : (editingId ? 'Update Decision' : 'Log Decision')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};