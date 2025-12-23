import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGoalsStore } from '../../stores/goalsStore';
import { Plus, Target, CheckCircle2, Circle, Archive, ChevronDown } from 'lucide-react';
import type { Goal, GoalCategory, Milestone } from '../../types';
import { Timestamp } from 'firebase/firestore';

const categories: { value: GoalCategory; label: string; color: string }[] = [
    { value: 'health', label: 'Health', color: 'bg-green-100 text-green-700' },
    { value: 'career', label: 'Career', color: 'bg-blue-100 text-blue-700' },
    { value: 'learning', label: 'Learning', color: 'bg-purple-100 text-purple-700' },
    { value: 'relationships', label: 'Relationships', color: 'bg-pink-100 text-pink-700' },
    { value: 'personal', label: 'Personal', color: 'bg-orange-100 text-orange-700' },
];

export const GoalsApp: React.FC = () => {
    const { user } = useAuth();
    const { goals, isLoading, subscribeToUserGoals, addGoal, toggleMilestone, archiveGoal, selectedCategory, setSelectedCategory } = useGoalsStore();
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'personal' as GoalCategory });
    const [newMilestones, setNewMilestones] = useState<string[]>(['']);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToUserGoals(user.uid);
        return () => unsubscribe();
    }, [user, subscribeToUserGoals]);

    const filteredGoals = goals.filter((g) => {
        if (g.status === 'archived') return false;
        if (selectedCategory && g.category !== selectedCategory) return false;
        return true;
    });

    const handleAddGoal = async () => {
        if (!user || !newGoal.title.trim()) return;

        const milestones: Milestone[] = newMilestones
            .filter((m) => m.trim())
            .map((m, i) => ({
                id: `milestone-${Date.now()}-${i}`,
                title: m.trim(),
                completed: false,
            }));

        await addGoal(user.uid, {
            ...newGoal,
            milestones,
            status: 'active',
        });

        setNewGoal({ title: '', description: '', category: 'personal' });
        setNewMilestones(['']);
        setShowNewGoal(false);
    };

    const getProgress = (goal: Goal) => {
        if (goal.milestones.length === 0) return 0;
        const completed = goal.milestones.filter((m) => m.completed).length;
        return Math.round((completed / goal.milestones.length) * 100);
    };

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-charcoal-800">Goals</h1>
                            <p className="text-sm text-charcoal-500">Directional planning without pressure</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewGoal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-sage-100 text-sage-700' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setSelectedCategory(cat.value)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.value ? cat.color : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Goals List */}
            <div className="flex-1 overflow-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
                    </div>
                ) : filteredGoals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-sage-100 rounded-2xl flex items-center justify-center">
                            <Target className="w-8 h-8 text-sage-400" />
                        </div>
                        <p className="text-charcoal-500 mb-2">No goals yet</p>
                        <p className="text-sm text-charcoal-400">Create your first goal to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredGoals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onToggleMilestone={(milestoneId) => user && toggleMilestone(user.uid, goal.id, milestoneId)}
                                onArchive={() => user && archiveGoal(user.uid, goal.id)}
                                progress={getProgress(goal)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* New Goal Modal */}
            {showNewGoal && (
                <div className="fixed inset-0 bg-charcoal-900/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-window max-w-lg w-full max-h-[80vh] overflow-auto animate-scale-in">
                        <div className="p-6 border-b border-charcoal-100">
                            <h2 className="font-display text-lg font-semibold text-charcoal-800">Create a New Goal</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Goal Title</label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="What do you want to achieve?"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Description</label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    placeholder="Why is this goal meaningful to you?"
                                    rows={3}
                                    className="input resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Category</label>
                                <select
                                    value={newGoal.category}
                                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })}
                                    className="input"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-2">Milestones</label>
                                <div className="space-y-2">
                                    {newMilestones.map((m, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            value={m}
                                            onChange={(e) => {
                                                const updated = [...newMilestones];
                                                updated[i] = e.target.value;
                                                setNewMilestones(updated);
                                            }}
                                            placeholder={`Milestone ${i + 1}`}
                                            className="input"
                                        />
                                    ))}
                                    <button
                                        onClick={() => setNewMilestones([...newMilestones, ''])}
                                        className="text-sm text-sage-600 hover:text-sage-700"
                                    >
                                        + Add milestone
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-charcoal-100 flex justify-end gap-3">
                            <button onClick={() => setShowNewGoal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleAddGoal} className="btn-primary">
                                Create Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Goal Card Component
const GoalCard: React.FC<{
    goal: Goal;
    onToggleMilestone: (id: string) => void;
    onArchive: () => void;
    progress: number;
}> = ({ goal, onToggleMilestone, onArchive, progress }) => {
    const [expanded, setExpanded] = useState(false);
    const category = categories.find((c) => c.value === goal.category);

    return (
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden transition-shadow hover:shadow-soft">
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {category && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                                    {category.label}
                                </span>
                            )}
                        </div>
                        <h3 className="font-medium text-charcoal-800">{goal.title}</h3>
                        {goal.description && (
                            <p className="text-sm text-charcoal-500 mt-1">{goal.description}</p>
                        )}
                    </div>
                    <button
                        onClick={onArchive}
                        className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-50 rounded-lg transition-colors"
                        title="Archive goal"
                    >
                        <Archive className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-charcoal-500 mb-1">
                        <span>{goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} milestones</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Milestones Toggle */}
                {goal.milestones.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 mt-3 text-sm text-charcoal-500 hover:text-charcoal-700"
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        {expanded ? 'Hide' : 'Show'} milestones
                    </button>
                )}
            </div>

            {/* Expanded Milestones */}
            {expanded && goal.milestones.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                    {goal.milestones.map((milestone) => (
                        <button
                            key={milestone.id}
                            onClick={() => onToggleMilestone(milestone.id)}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-cream-50 transition-colors text-left"
                        >
                            {milestone.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-sage-500 flex-shrink-0" />
                            ) : (
                                <Circle className="w-5 h-5 text-charcoal-300 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${milestone.completed ? 'text-charcoal-400 line-through' : 'text-charcoal-700'}`}>
                                {milestone.title}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
