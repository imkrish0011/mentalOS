import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const SplashScreen: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Animation timeline
        // 0ms: Mount
        // 2000ms: Start fading out
        // 2500ms: Unmount
        const timer1 = setTimeout(() => setIsVisible(false), 2000);
        const timer2 = setTimeout(() => setShouldRender(false), 2500);

        return () => {
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
                    <div className="text-center space-y-2">
                        <h1 className="font-display text-2xl font-bold text-charcoal-800 tracking-tight animate-fade-in-up">
                            MentalOS
                        </h1>
                        <div className="h-1 w-12 bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 rounded-full mx-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
};
