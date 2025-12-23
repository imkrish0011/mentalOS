import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Brain } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
}

export const FocusApp: React.FC = () => {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [settings] = useState<TimerSettings>({
        focus: 25,
        shortBreak: 5,
        longBreak: 15
    });

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Could add notification sound here
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(settings[mode] * 60);
    };

    const changeMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(settings[newMode] * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 100 - (timeLeft / (settings[mode] * 60)) * 100;

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-semibold text-charcoal-800">Focus Mode</h1>
                        <p className="text-sm text-charcoal-500">Deep work timer</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">

                {/* Mode Selectors */}
                <div className="flex p-1 bg-charcoal-100 rounded-xl">
                    <button
                        onClick={() => changeMode('focus')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'focus' ? 'bg-white shadow-sm text-charcoal-800' : 'text-charcoal-500 hover:text-charcoal-700'
                            }`}
                    >
                        Focus
                    </button>
                    <button
                        onClick={() => changeMode('shortBreak')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'shortBreak' ? 'bg-white shadow-sm text-charcoal-800' : 'text-charcoal-500 hover:text-charcoal-700'
                            }`}
                    >
                        Short Break
                    </button>
                    <button
                        onClick={() => changeMode('longBreak')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'longBreak' ? 'bg-white shadow-sm text-charcoal-800' : 'text-charcoal-500 hover:text-charcoal-700'
                            }`}
                    >
                        Long Break
                    </button>
                </div>

                {/* Timer Display */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Progress Circle Background */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-charcoal-100"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 120}
                            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                            className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-terracotta-400' : 'text-sage-400'
                                }`}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="text-center z-10">
                        <div className="text-6xl font-display font-bold text-charcoal-800 tabular-nums tracking-tight">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-charcoal-400 mt-2 font-medium uppercase tracking-widest text-xs">
                            {isActive ? 'Running' : 'Paused'}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTimer}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${isActive
                                ? 'bg-cream-100 text-charcoal-800 hover:bg-cream-200'
                                : 'bg-charcoal-800 text-white hover:bg-charcoal-700'
                            }`}
                    >
                        {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-12 h-12 rounded-xl bg-charcoal-100 text-charcoal-600 flex items-center justify-center hover:bg-charcoal-200 transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                {/* Tips */}
                <div className="bg-white p-4 rounded-xl border border-charcoal-100 max-w-sm w-full">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-cream-100 rounded-lg">
                            {mode === 'focus' ? <Brain className="w-5 h-5 text-terracotta-500" /> : <Coffee className="w-5 h-5 text-sage-500" />}
                        </div>
                        <div>
                            <h3 className="font-medium text-charcoal-800 text-sm">
                                {mode === 'focus' ? 'Focus Time' : 'Recharge Time'}
                            </h3>
                            <p className="text-xs text-charcoal-500 mt-1">
                                {mode === 'focus'
                                    ? 'Eliminate distractions. Single-task until the timer rings.'
                                    : 'Step away from the screen. Stretch, hydrate, or breathe.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
