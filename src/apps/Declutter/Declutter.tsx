import React, { useState, useEffect } from 'react';
import { Layers, Trash2, CheckCircle, Smartphone, Folder, Mail } from 'lucide-react';

interface DeclutterTask {
    id: string;
    category: 'desktop' | 'mobile' | 'email' | 'mind';
    text: string;
    completed: boolean;
}

const TASK_POOL: Record<string, string[]> = {
    desktop: [
        'Clear all icons from your desktop',
        'Empty Trash / Recycle Bin',
        'Close browser tabs you haven\'t used in 24h',
        'Delete 5 files from Downloads folder',
        'Organize one cluttered folder',
        'Update your OS or key apps',
        'Uninstall one unused program',
        'Review and delete old screenshots',
        'Sort files by "Date Modified" and delete the oldest 5',
        'Change desktop wallpaper to something clean/minimal',
        'Empty browser cache and cookies',
        'Remove unused extensions from your browser',
        'Clean up your Taskbar/Dock',
        'Delete old installers (.exe, .dmg, .msi)',
        'Rename 5 poorly named files',
        'Back up your critical folder to cloud',
    ],
    mobile: [
        'Delete 2 apps you never use',
        'Delete 10 blurry or duplicate photos',
        'Clear all notifications',
        'Disable notifications for one annoying app',
        'Close all open mobile browser tabs',
        'Clean your phone screen physically',
        'Unfollow 5 accounts that don\'t inspire you',
        'Delete old text message threads (OTP/Verify codes)',
        'Clear your podcast download queue',
        'Organize your home screen apps into folders',
        'Delete old screenshots from your camera roll',
        'Update all apps that need updates',
        'Review subscription list in App Store/Play Store',
        'Turn on "Do Not Disturb" for 1 hour',
        'Delete one social media app for 24 hours',
    ],
    email: [
        'Archive inbox to zero (or get close)',
        'Unsubscribe from 3 newsletters',
        'Delete all emails in Spam/Junk',
        'Clear the "Promotions" tab',
        'Respond to that one email you\'ve been avoiding',
        'Create a filter for recurring clutter',
        'Review your "Sent" folder for needed follow-ups',
        'Delete emails older than 1 year in "Social" tab',
        'Organize 5 loose emails into proper folders/labels',
        'Mark all unread "notification" emails as read',
        'Block one sender who spams you',
        'Clear out your "Drafts" folder',
        'Update your email signature',
    ],
    mind: [
        'Write down 3 "open loops" on your mind',
        'Review your calendar for tomorrow',
        'Turn off all screens for 10 minutes',
        'Do a brain dump of tasks into your Todo app',
        'Silence your phone for 1 hour',
        'Take 3 deep breaths before opening the next app',
        'Send a quick gratitude message to a friend',
        'Define your "Highlight" (main priority) for today',
        'Visualize your day going perfectly',
        'Step outside for fresh air (no phone)',
        'Drink a glass of water right now',
        'Stretch for 2 minutes away from the desk',
        'Read one article from your "Read Later" list',
    ],
};

const getDailyTasks = (): DeclutterTask[] => {
    const today = new Date().toDateString();
    // Simple hash of the date string to select indices
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
        seed = ((seed << 5) - seed) + today.charCodeAt(i);
        seed |= 0;
    }
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const categories = ['desktop', 'mobile', 'email', 'mind'] as const;

    return categories.map((cat, index) => {
        const pool = TASK_POOL[cat];
        // Pick one based on seeded random
        const taskIndex = Math.floor(random() * pool.length);
        return {
            id: `${cat}-${index}`,
            category: cat,
            text: pool[taskIndex],
            completed: false
        };
    });
};

export const DeclutterApp: React.FC = () => {
    const [tasks, setTasks] = useState<DeclutterTask[]>(() => {
        const saved = localStorage.getItem('declutter_tasks');
        const lastDate = localStorage.getItem('declutter_date');
        const today = new Date().toDateString();

        if (lastDate !== today) {
            // New day, get fresh tasks based on date
            localStorage.setItem('declutter_date', today);
            return getDailyTasks();
        }

        return saved ? JSON.parse(saved) : getDailyTasks();
    });

    useEffect(() => {
        localStorage.setItem('declutter_tasks', JSON.stringify(tasks));
        localStorage.setItem('declutter_date', new Date().toDateString());
    }, [tasks]);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        ));
    };

    const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    const categories = [
        { id: 'desktop', label: 'Desktop', icon: Folder, color: 'text-ocean-500', bg: 'bg-ocean-100' },
        { id: 'email', label: 'Email', icon: Mail, color: 'text-purple-500', bg: 'bg-purple-100' },
        { id: 'mobile', label: 'Mobile', icon: Smartphone, color: 'text-terracotta-500', bg: 'bg-terracotta-100' },
        { id: 'mind', label: 'Mental', icon: Layers, color: 'text-sage-500', bg: 'bg-sage-100' },
    ];

    return (
        <div className="h-full flex flex-col bg-cream-50">
            {/* Header */}
            <div className="p-6 border-b border-charcoal-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-charcoal-600 to-charcoal-700 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-xl font-semibold text-charcoal-800">Digital Declutter</h1>
                        <p className="text-sm text-charcoal-500">Daily micro-missions for clarity</p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-charcoal-700">Today's Progress</span>
                    <span className="text-charcoal-500">{progress}%</span>
                </div>
                <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-sage-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {categories.map(cat => (
                    <div key={cat.id}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 rounded-lg ${cat.bg}`}>
                                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                            </div>
                            <h3 className="font-medium text-charcoal-700">{cat.label} for {new Date().toLocaleDateString(undefined, { weekday: 'long' })}</h3>
                        </div>
                        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
                            {tasks.filter(t => t.category === cat.id).map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-full flex items-center gap-3 p-4 border-b last:border-0 border-charcoal-50 hover:bg-cream-50 transition-colors text-left group`}
                                >
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                        ${task.completed
                                            ? 'bg-sage-500 border-sage-500'
                                            : 'border-charcoal-200 group-hover:border-sage-400'
                                        }
                                    `}>
                                        {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={`flex-1 text-sm ${task.completed ? 'text-charcoal-400 line-through' : 'text-charcoal-700'}`}>
                                        {task.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {progress === 100 && (
                    <div className="p-4 bg-sage-100 rounded-xl text-sage-800 text-center animate-fade-in border border-sage-200">
                        <p className="font-medium">✨ All clear! See you tomorrow.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
