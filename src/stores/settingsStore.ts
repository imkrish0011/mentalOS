import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
    dockApps: string[];
    toggleDockApp: (appId: string) => void;
    notificationsEnabled: boolean;
    toggleNotifications: () => void;
}

const DEFAULT_DOCK_APPS = ['goals', 'habits', 'journal', 'mood', 'settings'];

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            dockApps: DEFAULT_DOCK_APPS,
            notificationsEnabled: true,

            toggleDockApp: (appId) => set((state) => {
                const isIncluded = state.dockApps.includes(appId);
                if (isIncluded) {
                    // Prevent removing the last app or Settings app if we decide to enforce that later
                    return { dockApps: state.dockApps.filter(id => id !== appId) };
                } else {
                    return { dockApps: [...state.dockApps, appId] };
                }
            }),

            toggleNotifications: () => set((state) => ({
                notificationsEnabled: !state.notificationsEnabled
            })),
        }),
        {
            name: 'mental-os-settings',
        }
    )
);
