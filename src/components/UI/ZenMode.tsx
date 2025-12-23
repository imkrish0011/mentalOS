import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { X, Play, Pause } from 'lucide-react';

interface ZenModeProps {
    isOpen: boolean;
    onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

export const ZenMode: React.FC<ZenModeProps> = ({ isOpen, onClose }) => {
    const [phase, setPhase] = useState<BreathingPhase>('idle');
    const [text, setText] = useState('Ready?');
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsActive(false);
            setPhase('idle');
            setText('Ready?');
            return;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isActive) return;

        let timeout: NodeJS.Timeout;

        const cycle = async () => {
            setPhase('inhale');
            setText('Inhale...');
            await new Promise(r => timeout = setTimeout(r, 4000));

            setPhase('hold');
            setText('Hold...');
            await new Promise(r => timeout = setTimeout(r, 4000));

            setPhase('exhale');
            setText('Exhale...');
            await new Promise(r => timeout = setTimeout(r, 4000));

            if (isActive) cycle();
        };

        cycle();

        return () => clearTimeout(timeout);
    }, [isActive]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-charcoal-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in text-white">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-6 h-6 text-white/70" />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full border border-sage-400/30 transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-150 opacity-100' : phase === 'exhale' ? 'scale-50 opacity-0' : phase === 'hold' ? 'scale-150 opacity-50' : 'scale-100 opacity-20'}`} />
                    <div className={`absolute inset-0 rounded-full bg-sage-500/10 blur-2xl transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-75' : phase === 'hold' ? 'scale-125' : 'scale-100'}`} />
                    <div className={`w-32 h-32 transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-90' : phase === 'hold' ? 'scale-125' : 'scale-100'}`}>
                        <Logo className="w-full h-full" animated={phase !== 'idle'} />
                    </div>
                </div>

                <h2 className="font-display text-4xl font-light tracking-wide mb-8 animate-pulse-slow">{text}</h2>

                <button onClick={() => { if (isActive) { setIsActive(false); setPhase('idle'); setText('Paused'); } else { setIsActive(true); } }} className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    <span className="font-medium tracking-wide">{isActive ? 'Pause' : 'Start Zen Mode'}</span>
                </button>
            </div>
            <p className="mb-10 text-white/30 text-sm">Box Breathing: 4s Inhale • 4s Hold • 4s Exhale</p>
        </div>
    );
};
