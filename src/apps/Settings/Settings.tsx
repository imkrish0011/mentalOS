import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Settings as SettingsIcon, User, Shield, Info, LogOut, BookOpen } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { UserManual } from '../../components/UI/UserManual';

// ALL APPS Definition (Temporary duplication, ideally shared config)
const ALL_APPS = [
    { id: 'goals', name: 'Goals' },
    { id: 'habits', name: 'Habits' },
    { id: 'journal', name: 'Journal' },
    { id: 'mood', name: 'Mood' },
    { id: 'focus', name: 'Focus Mode' },
    { id: 'clm', name: 'Cognitive Load' },
    { id: 'reflection', name: 'Reflection' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'declutter', name: 'Declutter' },
    { id: 'decision', name: 'Decisions' },
    { id: 'principles', name: 'Principles' },
];

export const SettingsApp: React.FC = () => {
    const { userProfile, signOut } = useAuth();
    const { dockApps, toggleDockApp, notificationsEnabled, toggleNotifications } = useSettingsStore();
    const [showManual, setShowManual] = useState(false);

    // Assuming activeSection is managed by state or context, for now, let's default it for rendering purposes
    // In a real app, this would be dynamic, e.g., using useState or URL params.
    const [activeSection] = React.useState('appearance'); // Default to 'appearance' for testing

    return (
        <div className="h-full flex flex-col bg-cream-50">
            <UserManual isOpen={showManual} onComplete={() => setShowManual(false)} />

            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal-400 to-charcoal-500 flex items-center justify-center">
                        <SettingsIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-semibold text-charcoal-800">Settings</h1>
                        <p className="text-sm text-charcoal-500">Manage your preferences</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                        <div className="px-4 py-3 bg-cream-50 border-b border-charcoal-100">
                            <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </div>
                        </div>
                        <div className="p-4">
                            {userProfile && (
                                <div className="flex items-center gap-4">
                                    {userProfile.photoURL ? (
                                        <img
                                            src={userProfile.photoURL}
                                            alt={userProfile.displayName}
                                            className="w-16 h-16 rounded-full border-2 border-sage-200"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 text-xl font-medium">
                                            {userProfile.displayName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-medium text-charcoal-800">{userProfile.displayName}</h3>
                                        <p className="text-sm text-charcoal-500">{userProfile.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Appearance / Dock Customization */}
                    {activeSection === 'appearance' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-charcoal-700 mb-4">Dock Customization</h3>
                                <p className="text-sm text-charcoal-500 mb-4">Select the apps you want to see in your quick access dock.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ALL_APPS.map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-charcoal-100 dark:border-charcoal-800">
                                            <span className="text-charcoal-700 font-medium">{app.name}</span>
                                            <button
                                                onClick={() => toggleDockApp(app.id)}
                                                className={`
                                                    w-12 h-6 rounded-full transition-colors relative
                                                    ${dockApps.includes(app.id) ? 'bg-sage-500' : 'bg-charcoal-200'}
                                                `}
                                            >
                                                <div className={`
                                                    absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm
                                                    ${dockApps.includes(app.id) ? 'left-7' : 'left-1'}
                                                `} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeSection === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-charcoal-700 mb-4">Notification Preferences</h3>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-100">
                                    <div>
                                        <p className="font-medium text-charcoal-700">Enable Gentle Reminders</p>
                                        <p className="text-sm text-charcoal-500">Allow minimal, non-intrusive check-ins.</p>
                                    </div>
                                    <button
                                        onClick={toggleNotifications}
                                        className={`
                                            w-12 h-6 rounded-full transition-colors relative
                                            ${notificationsEnabled ? 'bg-sage-500' : 'bg-charcoal-200'}
                                        `}
                                    >
                                        <div className={`
                                            absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm
                                            ${notificationsEnabled ? 'left-7' : 'left-1'}
                                        `} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Section */}
                    <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                        <div className="px-4 py-3 bg-cream-50 border-b border-charcoal-100">
                            <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                                <Shield className="w-4 h-4" />
                                <span>Privacy & Data</span>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <p className="text-sm text-charcoal-600">
                                Your data is stored securely in the cloud and synced across your devices.
                                Only you have access to your personal information.
                            </p>
                            <div className="flex items-center gap-2 text-xs text-sage-600">
                                <div className="w-2 h-2 rounded-full bg-sage-400" />
                                <span>Data encrypted in transit and at rest</span>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                        <div className="px-4 py-3 bg-cream-50 border-b border-charcoal-100">
                            <div className="flex items-center gap-2 text-sm font-medium text-charcoal-700">
                                <Info className="w-4 h-4" />
                                <span>About</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-display font-medium text-charcoal-800 mb-2">Mental Clarity OS</h3>
                            <p className="text-sm text-charcoal-600 mb-3">
                                A calm, minimalist digital environment for managing your inner life—goals,
                                habits, journaling, and mood tracking.
                            </p>
                            <p className="text-xs text-charcoal-400 mb-4">
                                Designed for clarity, built with care. No gamification, no pressure.
                            </p>
                            <button
                                onClick={() => setShowManual(true)}
                                className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                View User Manual
                            </button>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-white border border-charcoal-200 rounded-xl
                     text-charcoal-600 hover:bg-charcoal-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
