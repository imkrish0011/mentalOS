import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useWindowStore } from '../../stores/windowStore';
// Import icons mapping (copying from Dock logic or making a shared constant would be better, 
// but for now I'll use a simple hook or prop to get the app list).
// Actually, let's pull dockApps from Dock.tsx or just redefine here for simplicity to avoid circular deps if refactoring isn't done.
// Better approach: Define apps config in a shared `constants.ts` or `config.ts` later. 
// For now, I will start with a local definition to get it working efficiently.

// Re-using icon imports just for this component
import { Target, Sparkles, BookOpen, Heart, Settings, Maximize2, Activity, RefreshCw, Layers, Scale, Anchor, PlayCircle, HeartPulse } from 'lucide-react';

const apps = [
    { id: 'system', name: 'System', icon: HeartPulse },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'habits', name: 'Habits', icon: Sparkles },
    { id: 'rituals', name: 'Rituals', icon: PlayCircle },
    { id: 'journal', name: 'Journal', icon: BookOpen },
    { id: 'mood', name: 'Mood', icon: Heart },
    { id: 'focus', name: 'Focus Mode', icon: Maximize2 },
    { id: 'reflection', name: 'Reflection', icon: RefreshCw },
    { id: 'declutter', name: 'Declutter', icon: Layers },
    { id: 'decision', name: 'Decisions', icon: Scale },
    { id: 'principles', name: 'Principles', icon: Anchor },
    { id: 'settings', name: 'Settings', icon: Settings },
];

const appDefaultSizes: Record<string, { width: number; height: number }> = {
    system: { width: 900, height: 600 },
    goals: { width: 700, height: 550 },
    habits: { width: 650, height: 500 },
    rituals: { width: 800, height: 600 },
    journal: { width: 600, height: 650 },
    mood: { width: 550, height: 500 },
    settings: { width: 500, height: 450 },
    focus: { width: 500, height: 400 },
    reflection: { width: 700, height: 600 },
    declutter: { width: 400, height: 500 },
    decision: { width: 700, height: 600 },
    principles: { width: 600, height: 600 },
};

interface SpotlightProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const { openWindow, focusWindow, windows } = useWindowStore();

    // Filter apps
    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(query.toLowerCase())
    );

    // Reset query when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setActiveIndex(0);
        } else {
            // Focus input when opened
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle Launch
    const handleLaunch = (appId: string, appName: string) => {
        const existingWindow = windows.find(w => w.appId === appId);
        if (existingWindow) {
            focusWindow(existingWindow.id);
        } else {
            openWindow(appId, appName, appDefaultSizes[appId] || { width: 600, height: 500 });
        }
        onClose();
    };

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredApps.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredApps.length) % filteredApps.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredApps[activeIndex]) {
                    handleLaunch(filteredApps[activeIndex].id, filteredApps[activeIndex].name);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredApps, activeIndex, onClose, windows]);

    // Scroll active item into view
    useEffect(() => {
        if (resultsRef.current) {
            const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh] bg-black/20 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-charcoal-100 gap-3">
                    <Search className="w-5 h-5 text-charcoal-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search apps..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-charcoal-700 placeholder:text-charcoal-300"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                    />
                    <div className="flex items-center gap-1 px-2 py-1 bg-charcoal-50 rounded text-xs text-charcoal-400 font-medium font-mono mr-2">
                        ESC
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-charcoal-50 rounded-lg text-charcoal-400 hover:text-charcoal-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div ref={resultsRef} className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                    {filteredApps.length === 0 ? (
                        <div className="px-4 py-8 text-center text-charcoal-400">
                            No apps found for "{query}"
                        </div>
                    ) : (
                        filteredApps.map((app, index) => (
                            <button
                                key={app.id}
                                onClick={() => handleLaunch(app.id, app.name)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                                    ${index === activeIndex ? 'bg-sage-50 text-charcoal-800' : 'text-charcoal-600 hover:bg-cream-50'}
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center
                                    ${index === activeIndex ? 'bg-sage-100 text-sage-600' : 'bg-charcoal-50 text-charcoal-500'}
                                `}>
                                    <app.icon className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{app.name}</span>
                                {index === activeIndex && (
                                    <span className="ml-auto text-xs text-sage-500 font-medium">Open</span>
                                )}
                            </button>
                        ))
                    )}
                </div>

                <div className="px-4 py-2 bg-cream-50 border-t border-charcoal-50 flex items-center justify-between text-xs text-charcoal-400">
                    <div className="flex gap-4">
                        <span>↑↓ to navigate</span>
                        <span>↵ to open</span>
                    </div>
                    <span>MentalOS Spotlight</span>
                </div>
            </div>
        </div>
    );
};
