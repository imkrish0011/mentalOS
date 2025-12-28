import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, CheckCircle, ChevronRight, X } from 'lucide-react';
import type { Ritual, RitualStep } from '../../types';

interface RitualPlayerProps {
    ritual: Ritual;
    onClose: () => void;
    onComplete: () => void;
}

export const RitualPlayer: React.FC<RitualPlayerProps> = ({ ritual, onClose, onComplete }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const currentStep = ritual.steps[currentStepIndex];
    const progress = ((currentStepIndex) / ritual.steps.length) * 100;

    useEffect(() => {
        // Initialize timer for the step
        if (currentStep) {
            setTimeLeft(currentStep.duration * 60);
            setIsRunning(true);
        }
    }, [currentStepIndex, currentStep]);

    useEffect(() => {
        let interval: any;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            // Optional: Auto-advance or play sound?
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (currentStepIndex < ritual.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleFinish = () => {
        onComplete();
    };

    if (isFinished) {
        return (
            <div className="absolute inset-0 bg-charcoal-900 text-white z-50 flex flex-col items-center justify-center p-8 animate-fade-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-scale-in">
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Ritual Complete</h2>
                <p className="text-charcoal-300 text-center max-w-md mb-8">
                    "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                </p>
                <button
                    onClick={handleFinish}
                    className="bg-white text-charcoal-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-charcoal-900 text-white z-50 flex flex-col">
            {/* Header */}
            <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-2 text-charcoal-400">
                    <span className="text-xs uppercase tracking-wider font-medium">{ritual.title}</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-charcoal-800">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium mb-4">
                        Step {currentStepIndex + 1} of {ritual.steps.length}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">{currentStep.title}</h2>
                    {/* Could show description here if we had it per step */}
                </div>

                {/* Timer */}
                <div className="text-7xl md:text-8xl font-mono tabular-nums tracking-tighter mb-12 font-light">
                    {formatTime(timeLeft)}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>

                    <button
                        onClick={handleNext}
                        className="h-16 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 font-medium text-lg transition-colors group"
                    >
                        <span>{currentStepIndex === ritual.steps.length - 1 ? 'Finish' : 'Next Step'}</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Up Next Preview */}
            {currentStepIndex < ritual.steps.length - 1 && (
                <div className="p-6 text-center text-charcoal-500 text-sm">
                    Up next: <span className="text-charcoal-300">{ritual.steps[currentStepIndex + 1].title}</span>
                </div>
            )}
        </div>
    );
};
