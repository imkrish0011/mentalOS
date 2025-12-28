import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const SplashScreen: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animation timeline
        // 0-2000ms: Loading progress
        // 2000ms: Start fading out
        // 2500ms: Unmount

        const startTime = Date.now();
        const duration = 2000;

        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (elapsed >= duration) {
                clearInterval(progressInterval);
            }
        }, 16);

        const timer1 = setTimeout(() => setIsVisible(false), 2000);
        const timer2 = setTimeout(() => setShouldRender(false), 2500);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div
            className={`
                fixed inset-0 z-[100] bg-cream-50 flex items-center justify-center
                transition-opacity duration-700 ease-out
                ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
        >
            <div className={`transform transition-all duration-1000 ease-out ${isVisible ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
                <div className="flex flex-col items-center gap-6">
                    <div className="w-32 h-32 animate-bounce-gentle">
                        <Logo className="w-full h-full" animated />
                    </div>
                    <div className="text-center space-y-3 w-48">
                        <h1 className="font-display text-2xl font-bold text-charcoal-800 tracking-tight animate-fade-in-up">
                            ClarityOS
                        </h1>
                        <div className="h-1.5 w-full bg-charcoal-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-sage-400 to-ocean-500 rounded-full transition-all duration-100 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-charcoal-400 font-medium">Loading System...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
