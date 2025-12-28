import React from 'react';
import { useWindowStore } from '../../stores/windowStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Target, Sparkles, BookOpen, Heart, Settings, Maximize2, Activity, RefreshCw, Bell, Layers, Scale, Anchor, PlayCircle, HeartPulse } from 'lucide-react';

interface DockApp {
    id: string;
    name: string;
    icon: React.ReactNode;
}

const dockApps: DockApp[] = [
    {
        id: 'system',
        name: 'System',
        icon: <HeartPulse className="w-6 h-6" />
    },
    {
        id: 'goals',
        name: 'Goals',
        icon: <Target className="w-6 h-6" />
    },
    {
        id: 'habits',
        name: 'Habits',
        icon: <Sparkles className="w-6 h-6" />
    },
    {
        id: 'rituals',
        name: 'Rituals',
        icon: <PlayCircle className="w-6 h-6" />
    },
    {
        id: 'journal',
        name: 'Journal',
        icon: <BookOpen className="w-6 h-6" />
    },
    {
        id: 'mood',
        name: 'Mood',
        icon: <Heart className="w-6 h-6" />
    },
    { id: 'focus', name: 'Focus Mode', icon: <Maximize2 className="w-6 h-6" /> },
    { id: 'reflection', name: 'Reflection', icon: <RefreshCw className="w-6 h-6" /> },
    { id: 'declutter', name: 'Declutter', icon: <Layers className="w-6 h-6" /> },
    { id: 'decision', name: 'Decisions', icon: <Scale className="w-6 h-6" /> },
    { id: 'principles', name: 'Principles', icon: <Anchor className="w-6 h-6" /> },
    {
        id: 'settings',
        name: 'Settings',
        icon: <Settings className="w-6 h-6" />
    },
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

export const Dock: React.FC = () => {
    const { windows, openWindow, focusWindow, restoreWindow, minimizeWindow, activeWindowId } = useWindowStore();
    const { dockApps: visibleAppIds } = useSettingsStore();

    // Filter apps based on settings
    const visibleApps = dockApps.filter(app => visibleAppIds.includes(app.id));

    const handleAppClick = (app: DockApp) => {
        // Check if app is already open
        const existingWindow = windows.find((w) => w.appId === app.id);

        if (existingWindow) {
            // If window is open and active, minimize it
            if (activeWindowId === existingWindow.id && existingWindow.state !== 'minimized') {
                minimizeWindow(existingWindow.id);
            }
            // If window is minimized, restore it
            else if (existingWindow.state === 'minimized') {
                restoreWindow(existingWindow.id);
            }
            // If window is open but not focused, focus it
            else {
                focusWindow(existingWindow.id);
            }
        } else {
            openWindow(app.id, app.name, appDefaultSizes[app.id]);
        }
    };

    const isAppOpen = (appId: string) =>
        windows.some((w) => w.appId === appId && w.state !== 'minimized');

    const isAppMinimized = (appId: string) =>
        windows.some((w) => w.appId === appId && w.state === 'minimized');

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="flex justify-center pb-3 pt-2">
                <div className="glass rounded-2xl px-2 sm:px-4 py-2 shadow-dock border border-white/50 max-w-[95vw] overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    <div className="flex items-center gap-1 sm:gap-2">
                        {visibleApps.map((app) => (
                            <button
                                key={app.id}
                                data-dock-app-id={app.id}
                                onClick={() => handleAppClick(app)}
                                className={`
                  relative group flex items-center justify-center
                  w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0
                  transition-all duration-200 ease-out
                  hover:scale-110 hover:bg-cream-100
                  focus:outline-none focus:ring-2 focus:ring-sage-300 focus:ring-offset-2
                  ${isAppOpen(app.id) ? 'bg-sage-50 text-sage-600' : 'text-charcoal-500'}
                  ${isAppMinimized(app.id) ? 'opacity-60' : ''}
                `}
                                title={app.name}
                            >
                                {app.icon}

                                {/* Active Indicator */}
                                {(isAppOpen(app.id) || isAppMinimized(app.id)) && (
                                    <span
                                        className={`
                      absolute -bottom-1 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full
                      ${isAppOpen(app.id) ? 'bg-sage-500' : 'bg-charcoal-300'}
                    `}
                                    />
                                )}

                                {/* Tooltip */}
                                <span className="
                  absolute -top-10 left-1/2 -translate-x-1/2
                  px-2 py-1 bg-charcoal-800 text-white text-xs rounded-lg
                  opacity-0 group-hover:opacity-100 transition-opacity
                  pointer-events-none whitespace-nowrap
                ">
                                    {app.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
