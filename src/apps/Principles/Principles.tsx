import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Anchor, Plus, Trash2, Loader2, Quote } from 'lucide-react';
import { createPrinciple, getPrinciples, deletePrinciple, type Principle } from '../../lib/firestoreService';
import { useToastStore } from '../../stores/toastStore';
import { DeleteConfirmModal } from '../../components/UI/DeleteConfirmModal';

export const PrinciplesApp: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToastStore();
    const [principles, setPrinciples] = useState<Principle[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Delete Modal State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State
    const [newText, setNewText] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        if (!user) return;
        loadPrinciples();
    }, [user]);

    const loadPrinciples = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getPrinciples(user.uid);
            setPrinciples(data);
        } catch (error) {
            console.error('Error loading principles:', error);
            showToast('Failed to load principles', 'error');
        }
        setIsLoading(false);
    };

    const handleAdd = async () => {
        if (!user || !newText.trim()) return;

        setIsSaving(true);
        try {
            const principleData = {
                title: newText,
                description: newDesc,
            };
            const id = await createPrinciple(user.uid, principleData);

            await loadPrinciples();

            setNewText('');
            setNewDesc('');
            setIsAdding(false);
            showToast('Principle saved');
        } catch (error) {
            console.error('Error saving principle:', error);
            showToast('Failed to save principle', 'error');
        }
        setIsSaving(false);
    };

    const confirmDelete = async () => {
        if (!user || !deleteId) return;

        try {
            const id = deleteId;
            setDeleteId(null); // Close modal immediately
            setPrinciples(prev => prev.filter(p => p.id !== id)); // Optimistic delete
            await deletePrinciple(user.uid, id);
            showToast('Principle deleted');
        } catch (error) {
            console.error('Error deleting principle:', error);
            showToast('Failed to delete principle', 'error');
            loadPrinciples(); // Revert
        }
    };

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Custom Delete Modal */}
            <DeleteConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Delete Principle"
                message="Are you sure you want to delete this principle? This action cannot be undone."
            />

            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <Anchor className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Principles</h1>
                            <p className="text-sm text-charcoal-500">Your operating system for life</p>
                        </div>
                    </div>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Principle
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">

                {/* Add Form */}
                {isAdding && (
                    <div className="bg-white p-5 rounded-xl border border-charcoal-100 shadow-sm mb-6 animate-scale-in">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Principle (e.g., 'Extreme Ownership')"
                            value={newText}
                            onChange={e => setNewText(e.target.value)}
                            className="w-full text-lg font-medium text-charcoal-800 placeholder:text-charcoal-300 border-none outline-none mb-2"
                        />
                        <textarea
                            placeholder="Elaborate on what this means..."
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            className="w-full text-sm text-charcoal-600 placeholder:text-charcoal-300 border-none outline-none resize-none h-16"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-3 py-1.5 text-sm text-charcoal-500 hover:bg-charcoal-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={isSaving}
                                className="px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}

                {/* List */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-indigo-200 animate-spin" />
                    </div>
                ) : principles.length === 0 && !isAdding ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Anchor className="w-8 h-8 text-indigo-400" />
                        </div>
                        <p className="text-charcoal-500 mb-2">No principles defined yet</p>
                        <p className="text-sm text-charcoal-400">Codify your values</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {principles.map(p => (
                            <div key={p.id} className="group bg-white p-6 rounded-2xl border border-charcoal-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Quote className="w-4 h-4" />
                                    </div>
                                    <button
                                        onClick={() => setDeleteId(p.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-charcoal-300 hover:text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="font-display font-semibold text-lg text-charcoal-800 mb-2 leading-tight">
                                    {p.title}
                                </h3>
                                <p className="text-sm text-charcoal-500 leading-relaxed">
                                    {p.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
