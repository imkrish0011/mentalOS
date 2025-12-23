import React, { useState } from 'react';
import { Logo } from './Logo';
import { Target, Sparkles, Brain, Scale, ArrowRight, Check } from 'lucide-react';

interface UserManualProps {
    onComplete: () => void;
    isOpen: boolean;
}

export const UserManual: React.FC<UserManualProps> = ({ onComplete, isOpen }) => {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to MentalOS",
            icon: Logo,
            description: "Your personalized operating system for clarity, focus, and mental well-being.",
            content: (
                <div className="space-y-4 text-center text-charcoal-600">
                    <p>Designed to reduce cognitive load and help you align your daily actions with your life principles.</p>
                    <p>Take a quick tour to optimize your experience.</p>
                </div>
            )
        },
        {
            title: "Track What Matters",
            icon: Target,
            description: "Goals & Habits Logic",
            content: (
                <div className="text-sm text-charcoal-600 space-y-3 text-left bg-sage-50 p-4 rounded-xl">
                    <div className="flex gap-2">
                        <Target className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Goals:</strong> Define your long-term vision in different life areas.</p>
                    </div>
                    <div className="flex gap-2">
                        <Sparkles className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Habits:</strong> Daily actions that compound toward your goals.</p>
                    </div>
                    <p className="italic text-xs text-charcoal-500 mt-2">Check them off daily to maintain streaks.</p>
                </div>
            )
        },
        {
            title: "Master Your Mind",
            icon: Brain,
            description: "Cognitive Load & Decisions",
            content: (
                <div className="text-sm text-charcoal-600 space-y-3 text-left bg-ocean-50 p-4 rounded-xl">
                    <div className="flex gap-2">
                        <Brain className="w-4 h-4 text-ocean-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Cognitive Load:</strong> Real-time monitoring of your mental bandwidth.</p>
                    </div>
                    <div className="flex gap-2">
                        <Scale className="w-4 h-4 text-ocean-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Decisions:</strong> Log choices to avoid fatigue and review outcomes later.</p>
                    </div>
                </div>
            )
        },
        {
            title: "You are Ready",
            icon: Logo,
            description: "Your space is set up.",
            content: (
                <div className="space-y-4 text-center text-charcoal-600">
                    <p>You can access this manual anytime from the <strong>Settings</strong> app.</p>
                    <p className="font-medium text-charcoal-800">Begin your journey toward clarity.</p>
                </div>
            )
        }
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    return (
        <div className="fixed inset-0 z-[200] bg-cream-50/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">

                {/* Progress */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-charcoal-50">
                    <div
                        className="h-full bg-sage-500 transition-all duration-500 ease-out"
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 pb-6">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                        {step === 0 || step === 3 ? (
                            <Logo className="w-full h-full" animated />
                        ) : (
                            <div className="w-14 h-14 bg-sage-50 rounded-2xl flex items-center justify-center text-sage-600">
                                <currentStep.icon className="w-8 h-8" />
                            </div>
                        )}
                    </div>

                    {/* Text */}
                    <div className="text-center mb-8">
                        <h2 className="font-display text-2xl font-bold text-charcoal-800 mb-2">{currentStep.title}</h2>
                        <p className="text-charcoal-500 font-medium">{currentStep.description}</p>
                    </div>

                    {/* Content */}
                    <div className="min-h-[120px] mb-8 flex items-center justify-center">
                        {currentStep.content}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex gap-1.5">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-charcoal-800' : 'bg-charcoal-200'}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (isLastStep) {
                                    onComplete();
                                } else {
                                    setStep(s => s + 1);
                                }
                            }}
                            className={`
                                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform active:scale-95
                                ${isLastStep
                                    ? 'bg-charcoal-800 text-white hover:bg-charcoal-700 shadow-lg shadow-sage-500/20'
                                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                                }
                            `}
                        >
                            {isLastStep ? 'I Read' : 'Next'}
                            {isLastStep ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
