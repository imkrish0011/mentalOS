import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Brain, CheckCircle2, AlertTriangle, Zap, Scale, Layers } from 'lucide-react';
import { getHabits, getGoals, getDecisions, getMoodLogs, getHabitLogs } from '../../lib/firestoreService';
import { useToastStore } from '../../stores/toastStore';
import type { Goal, Habit, Decision, MoodLog } from '../../types';

export const CLMApp: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [todayDecisions, setTodayDecisions] = useState<Decision[]>([]);
    const [latestMood, setLatestMood] = useState<MoodLog | null>(null);
    const [completedHabitCount, setCompletedHabitCount] = useState(0);

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
            // 1. Fetch Goals (Open Loops)
            const goals = await getGoals(user.uid, 'active');
            setActiveGoals(goals);

            // 2. Fetch Habits & Today's Logs (Task Load)
            const allHabits = await getHabits(user.uid);
            setHabits(allHabits);

            // Get today's completion count. Note: This relies on simple fetching
            // ideally passed from habit store, but we'll fetch minimally here
            const today = new Date().toLocaleDateString('en-CA');
            let completedCount = 0;
            // Checking completion is expensive without a better query, 
            // so we'll approximate active habits count as default load
            // and maybe refined later. For now, active habits = load.
            setCompletedHabitCount(0); // Placeholder if we don't query every log

            // 3. Fetch Decisions (Decision Fatigue)
            const decisions = await getDecisions(user.uid, 10); // get last 10, filter for today
            const todayDate = new Date().toLocaleDateString();
            const todayDecs = decisions.filter(d =>
                // Handle different date formats or timestamps if needed, simplistic check:
                (d.createdAt as any)?.toDate ? (d.createdAt as any).toDate().toLocaleDateString() === todayDate : true
            );
            setTodayDecisions(todayDecs);

            // 4. Fetch Mood (Emotional Load)
            const moodLogs = await getMoodLogs(user.uid, 1);
            if (moodLogs.length > 0) {
                setLatestMood(moodLogs[0]);
            }

        } catch (error) {
            console.error('Error loading CLM data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isLoading) return;
        calculateMetrics();
    }, [activeGoals, habits, todayDecisions, latestMood, isLoading]);

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

        // 3. Decision Fatigue
        const decisionImpact = todayDecisions.length * 5; // 5% per decision recorded
        score += decisionImpact;
        if (decisionImpact > 15) stressors.push({ name: 'Decision Fatigue', impact: decisionImpact });

        // 4. Emotional Load (Multiplier)
        let emotionalImpact = 0;
        if (latestMood) {
            // Stress: 1-5. Impact: 5%, 10%, 20%, 30%, 40%
            const stressLevels = [0, 5, 10, 20, 30, 40];
            const stressVal = latestMood.stress || 1;
            emotionalImpact += stressLevels[stressVal] || 0;

            // Energy: Low energy increases load
            // Energy 1 (Low) -> +20%, Energy 5 (High) -> -10% (buffer)
            const energyVal = latestMood.energy || 3;
            if (energyVal <= 2) emotionalImpact += 15;
            if (energyVal === 5) score -= 10; // High energy buffer
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
        if (score > 80) setRecommendation('⚠️ Critical: Disconnect immediately. Do non-linear activities (walk, nap).');
        else if (score > 60) {
            if (topStressor === 'Decision Fatigue') setRecommendation('Defer further decisions. Stick to defaults.');
            else if (topStressor === 'Active Goals') setRecommendation('Too many open loops. Focus on ONE goal today.');
            else if (topStressor === 'Emotional Strain') setRecommendation('Journaling recommended. Externalize your thoughts.');
            else setRecommendation('Take a 10min restoration break.');
        } else if (score < 30) {
            setRecommendation('🧠 Prime state for Deep Work or learning complex topics.');
        } else {
            setRecommendation('Maintain steady pace. Monitor energy levels.');
        }
    };

    const getStatusColor = (val: number) => {
        if (val < 35) return 'text-sage-600';
        if (val < 65) return 'text-ocean-600';
        if (val < 85) return 'text-orange-600';
        return 'text-red-600';
    };

    const getRingColor = (val: number) => {
        if (val < 35) return 'stroke-sage-500';
        if (val < 65) return 'stroke-ocean-500';
        if (val < 85) return 'stroke-orange-500';
        return 'stroke-red-500';
    };

    return (
        <div className="h-full flex flex-col bg-cream-50 overflow-auto">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="font-display text-2xl font-bold text-charcoal-700 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-charcoal-400" />
                        Cognitive Load
                    </h1>
                    <p className="text-charcoal-500 text-sm">Real-time mental capacity monitoring</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-charcoal-300 border-t-charcoal-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Main Gauge */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100 flex items-center justify-between relative overflow-hidden">
                            <div className="z-10">
                                <h2 className="text-sm font-medium text-charcoal-500 mb-1">Current Status</h2>
                                <div className={`text-3xl font-bold ${getStatusColor(loadScore)}`}>
                                    {status}
                                </div>
                                <div className="text-xs text-charcoal-400 mt-1">
                                    Primary Load: <span className="font-medium text-charcoal-600">{primaryStressor}</span>
                                </div>
                            </div>

                            {/* Circular Progress (CSS based) */}
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-charcoal-50"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="36"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - loadScore / 100)}`}
                                        className={`${getRingColor(loadScore)} transition-all duration-1000 ease-out`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute font-bold text-charcoal-700 text-lg">
                                    {Math.round(loadScore)}%
                                </div>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${loadScore > 60 ? 'bg-orange-50 border-orange-100' : 'bg-ocean-50 border-ocean-100'
                            }`}>
                            <Zap className={`w-5 h-5 flex-shrink-0 ${loadScore > 60 ? 'text-orange-500' : 'text-ocean-500'}`} />
                            <div>
                                <h3 className={`text-sm font-bold mb-1 ${loadScore > 60 ? 'text-orange-800' : 'text-ocean-800'}`}>
                                    Recommendation
                                </h3>
                                <p className={`text-sm ${loadScore > 60 ? 'text-orange-700' : 'text-ocean-700'}`}>
                                    {recommendation}
                                </p>
                            </div>
                        </div>

                        {/* Factor Breakdown */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal-100">
                            <h3 className="text-sm font-medium text-charcoal-700 mb-4">Load Factors</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal-700">Open Loops</p>
                                            <p className="text-xs text-charcoal-400">{activeGoals.length} Active Goals</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-charcoal-600">{Math.min(activeGoals.length * 4, 100)}%</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal-700">Routine Pressure</p>
                                            <p className="text-xs text-charcoal-400">{habits.length} Daily Habits</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-charcoal-600">{Math.min(habits.length * 3, 100)}%</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-charcoal-50 rounded-lg text-charcoal-600">
                                            <Scale className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal-700">Decision Fatigue</p>
                                            <p className="text-xs text-charcoal-400">{todayDecisions.length} Decisions Today</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-charcoal-600">{Math.min(todayDecisions.length * 5, 100)}%</div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal-700">Emotional State</p>
                                            <p className="text-xs text-charcoal-400">{latestMood ? `Stress: ${latestMood.stress}/5` : 'No mood data'}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-charcoal-600">
                                        {latestMood ? (latestMood.stress || 0) * 10 : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
