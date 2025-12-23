import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationsApp: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-cream-50 p-6">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-charcoal-700">Notifications</h1>
                <p className="text-charcoal-500">Ethical, non-intrusive reminders.</p>
            </div>

            <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-charcoal-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center text-sage-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-charcoal-700">Gentle Check-ins</h3>
                            <p className="text-xs text-charcoal-500">Soft reminders without urgency.</p>
                        </div>
                    </div>
                    <div className="w-12 h-6 bg-sage-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
};
