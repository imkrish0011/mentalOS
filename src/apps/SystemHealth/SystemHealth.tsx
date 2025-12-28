import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Brain, CheckCircle2, Zap, Target, Layers, HeartPulse } from 'lucide-react';
import { getHabits, getGoals, getMoodLogs, getHabitLogs } from '../../lib/firestoreService';
import type { Goal, Habit, MoodLog } from '../../types';

export const SystemHealthApp: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [latestMood, setLatestMood] = useState<MoodLog | null>(null);
    const [habitCompletionRate, setHabitCompletionRate] = useState(0);

    // Derived Metrics
    const [loadScore, setLoadScore] = useState(0);
    const [status, setStatus] = useState<'Optimal' | 'Moderate' | 'High' | 'Overload'>('Optimal');
    const [primaryStressor, setPrimaryStressor] = useState<string>('');
    const [recommendation, setRecommendation] = useState<string>('');

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // 1. Fetch Goals
            const goals = await getGoals(user.uid, 'active');
            setActiveGoals(goals);

            // 2. Fetch Habits & Today's Logs
            const allHabits = await getHabits(user.uid);
            setHabits(allHabits);

            // Fetch recent habit logs to calculate today's completion roughly
            // Ideally we'd have a more robust query for today's stats, but we'll infer from recent logs for now
            // or just use 0 as a placeholder if no logs found.
            // For true accuracy we'd need to fetch logs for *today*.
            // Let's settle for fetching last 1 day of logs for each habit - this is N requests, might be heavy.
            // Optimization: Just show total count for now.
            setHabitCompletionRate(0); // Placeholder

            // 3. Fetch Mood
            const moodLogs = await getMoodLogs(user.uid, 1);
            if (moodLogs.length > 0) {
                setLatestMood(moodLogs[0]);
            }

        } catch (error) {
            console.error('Error loading System Health data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isLoading) return;
        calculateMetrics();
    }, [activeGoals, habits, latestMood, isLoading]);

    const calculateMetrics = () => {
        let score = 0;
        let stressors: { name: string; impact: number }[] = [];

        // 1. Goal Load (Open Loops)
        const goalImpact = activeGoals.length * 4; // 4% per active goal
        score += goalImpact;
        if (goalImpact > 20) stressors.push({ name: 'Active Goals', impact: goalImpact });

        // 2. Habit Load (Routine Pressure)
        const habitImpact = habits.length * 3; // 3% per habit
        score += habitImpact;
        if (habitImpact > 25) stressors.push({ name: 'Daily Routine', impact: habitImpact });

        // 3. Emotional Load (Multiplier)
        let emotionalImpact = 0;
        if (latestMood) {
            const stressLevels = [0, 5, 10, 20, 30, 40];
            const stressVal = latestMood.stress || 1;
            emotionalImpact += stressLevels[stressVal] || 0;

            const energyVal = latestMood.energy || 3;
            if (energyVal <= 2) emotionalImpact += 15;
            if (energyVal === 5) score -= 10;
        }
        score += emotionalImpact;
        if (emotionalImpact > 25) stressors.push({ name: 'Emotional Strain', impact: emotionalImpact });

        // Cap at 100
        score = Math.min(Math.max(score, 5), 100);
        setLoadScore(score);

        // Determine Status
        if (score < 35) setStatus('Optimal');
        else if (score < 65) setStatus('Moderate');
        else if (score < 85) setStatus('High');
        else setStatus('Overload');

        // Identify Primary Stressor
        stressors.sort((a, b) => b.impact - a.impact);
        const topStressor = stressors.length > 0 ? stressors[0].name : 'None';
        setPrimaryStressor(topStressor);

        // Recommendation
        if (score > 80) setRecommendation('Critically Overloaded. Disconnect immediately.');
        else if (score > 60) setRecommendation('High Load. Focus on one task only.');
        else if (score > 35) setRecommendation('Moderate Load. Maintain steady pace.');
        else setRecommendation('Optimal State. Prime for Deep Work.');
    };

    const getStatusColor = (val: number) => {
        if (val < 35) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (val < 65) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (val < 85) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="h-full flex flex-col bg-cream-50 overflow-hidden">
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                        <HeartPulse className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-semibold text-charcoal-800">System Health</h1>
                        <p className="text-sm text-charcoal-500">Live bio-metrics dashboard</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Cognitive Load */}
                            <div className="bg-white p-5 rounded-2xl border border-charcoal-100 shadow-sm relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(loadScore)}`}>
                                        {status}
                                    </span>
                                </div>
                                <h3 className="text-charcoal-500 text-sm font-medium mb-1">Cognitive Load</h3>
                                <div className="text-3xl font-display font-bold text-charcoal-800">{Math.round(loadScore)}%</div>
                                <p className="text-xs text-charcoal-400 mt-2 line-clamp-1">{recommendation}</p>
                            </div>

                            {/* Emotional State */}
                            <div className="bg-white p-5 rounded-2xl border border-charcoal-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                        <Brain className="w-4 h-4" />
                                    </div>
                                </div>
                                <h3 className="text-charcoal-500 text-sm font-medium mb-1">Emotional State</h3>
                                <div className="text-3xl font-display font-bold text-charcoal-800">
                                    {latestMood ? `${latestMood.stress}/5` : '-'}
                                </div>
                                <p className="text-xs text-charcoal-400 mt-2">Current Stress Level</p>
                            </div>

                            {/* Active Goals */}
                            <div className="bg-white p-5 rounded-2xl border border-charcoal-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                        {activeGoals.length} Pending
                                    </span>
                                </div>
                                <h3 className="text-charcoal-500 text-sm font-medium mb-1">Active Projects</h3>
                                <div className="space-y-1 mt-2">
                                    {activeGoals.slice(0, 2).map(g => (
                                        <div key={g.id} className="text-xs text-charcoal-600 truncate flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            {g.title}
                                        </div>
                                    ))}
                                    {activeGoals.length === 0 && <span className="text-xs text-charcoal-300">No active goals</span>}
                                </div>
                            </div>
                        </div>

                        {/* Detailed Breakdown Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Habits Status */}
                            <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-sm">
                                <h3 className="font-display font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Daily Routine Load
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-cream-50 p-3 rounded-lg">
                                        <span className="text-sm text-charcoal-600">Total Habits</span>
                                        <span className="font-mono font-bold text-charcoal-800">{habits.length}</span>
                                    </div>
                                    <div className="w-full bg-charcoal-100 rounded-full h-2">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full"
                                            style={{ width: `${Math.min((habits.length * 3), 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-charcoal-400">
                                        Each habit adds roughly 3% to your background mental processing load.
                                        Keep total habits under 10 for optimal flow.
                                    </p>
                                </div>
                            </div>

                            {/* Load Analysis */}
                            <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-sm">
                                <h3 className="font-display font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    Stress Analysis
                                </h3>

                                {loadScore > 50 ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                                            <span className="font-bold">Primary Drain:</span> {primaryStressor}
                                        </div>
                                        <p className="text-sm text-charcoal-600">
                                            Your cognitive load is elevated. This reduces your ability to make quality decisions and increases irritability.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-800">
                                            <span className="font-bold">All Systems:</span> Nominal
                                        </div>
                                        <p className="text-sm text-charcoal-600">
                                            You have plenty of mental bandwidth available. This is the perfect time to tackle complex creative work.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
