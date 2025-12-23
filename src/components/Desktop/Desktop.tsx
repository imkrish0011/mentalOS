import React, { useState, useEffect } from 'react';
import { useWindowStore } from '../../stores/windowStore';
import { Window } from '../Window/Window';
import { Dock } from '../Dock/Dock';
import { Spotlight } from '../Spotlight/Spotlight';
import { useAuth } from '../../hooks/useAuth';
import { Search, Wind } from 'lucide-react';
import { Logo } from '../UI/Logo';
import { SplashScreen } from '../UI/SplashScreen';
import { UserManual } from '../UI/UserManual';
import { ZenMode } from '../UI/ZenMode';
import { PrinciplesWidget } from './PrinciplesWidget';
import { updateUserProfile } from '../../lib/firestoreService';
import { GoalsApp } from '../../apps/Goals/Goals';
import { HabitsApp } from '../../apps/Habits/Habits';
import { JournalApp } from '../../apps/Journal/Journal';
import { MoodApp } from '../../apps/Mood/Mood';
import { SettingsApp } from '../../apps/Settings/Settings';
import { FocusApp } from '../../apps/Focus/Focus';
import { CLMApp } from '../../apps/CLM/CLM';
import { ReflectionApp } from '../../apps/Reflection/Reflection';
import { NotificationsApp } from '../../apps/Notifications/Notifications';
import { DeclutterApp } from '../../apps/Declutter/Declutter';
import { DecisionApp } from '../../apps/Decision/Decision';
import { PrinciplesApp } from '../../apps/Principles/Principles';

const appComponents: Record<string, React.ComponentType> = {
    goals: GoalsApp,
    habits: HabitsApp,
    journal: JournalApp,
    mood: MoodApp,
    settings: SettingsApp,
    focus: FocusApp,
    clm: CLMApp,
    reflection: ReflectionApp,
    notifications: NotificationsApp,
    declutter: DeclutterApp,
    decision: DecisionApp,
    principles: PrinciplesApp,
};

export const Desktop: React.FC = () => {
    const { windows } = useWindowStore();
    const { userProfile, user, signOut } = useAuth();
    const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isZenModeOpen, setIsZenModeOpen] = useState(false);

    useEffect(() => {
        if (userProfile && userProfile.hasSeenManual === false) {
            setShowOnboarding(true);
        } else if (userProfile && userProfile.hasSeenManual === undefined) {
            setShowOnboarding(true);
        }
    }, [userProfile]);

    const handleManualComplete = async () => {
        if (user) {
            setShowOnboarding(false);
            try {
                await updateUserProfile(user.uid, { hasSeenManual: true });
            } catch (error) {
                console.error("Failed to update onboarding status", error);
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSpotlightOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <SplashScreen />
            <UserManual isOpen={showOnboarding} onComplete={handleManualComplete} />
            <ZenMode isOpen={isZenModeOpen} onClose={() => setIsZenModeOpen(false)} />

            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2560&auto=format&fit=crop")',
                    filter: 'brightness(0.95)'
                }}
            />
            <PrinciplesWidget />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />

            <div className="absolute top-0 left-0 right-0 z-40 glass border-b border-white/50">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <Logo className="w-full h-full" />
                        </div>
                        <span className="font-display font-medium text-charcoal-700">Mental Clarity OS</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={() => setIsZenModeOpen(true)} className="p-2 hover:bg-sage-100 rounded-lg text-sage-600 hover:text-sage-700 transition-colors" title="Zen Mode">
                            <Wind className="w-4 h-4" />
                        </button>

                        <button onClick={() => setIsSpotlightOpen(true)} className="p-2 hover:bg-black/5 rounded-lg text-charcoal-500 hover:text-charcoal-700 transition-colors" title="Search">
                            <Search className="w-4 h-4" />
                        </button>

                        <span className="text-sm text-charcoal-500 hidden sm:block">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>

                        {userProfile && (
                            <div className="flex items-center gap-2">
                                {userProfile.photoURL ? (
                                    <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-7 h-7 rounded-full border border-charcoal-200" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-sage-200 flex items-center justify-center text-sage-700 text-xs font-medium">
                                        {userProfile.displayName?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <button onClick={signOut} className="text-xs text-charcoal-500 hover:text-charcoal-700 transition-colors">Sign out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 pt-12 pb-14">
                {windows.map((win) => {
                    const AppComponent = appComponents[win.appId];
                    if (!AppComponent) return null;
                    return (
                        <Window key={win.id} window={win}>
                            <AppComponent />
                        </Window>
                    );
                })}

                {windows.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center animate-fade-in relative z-10">
                            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <Logo className="w-full h-full" animated />
                            </div>
                            <h2 className="font-display text-2xl text-charcoal-700 mb-2">Welcome to your space</h2>
                            <p className="text-charcoal-500 max-w-sm">Click an app in the dock below to explore</p>
                        </div>
                    </div>
                )}
            </div>
            <Dock />
            <Spotlight isOpen={isSpotlightOpen} onClose={() => setIsSpotlightOpen(false)} />
        </div>
    );
};
