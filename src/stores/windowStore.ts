import { create } from 'zustand';
import type { WindowInstance, WindowState } from '../types';

interface WindowStore {
    windows: WindowInstance[];
    activeWindowId: string | null;
    nextZIndex: number;

    // Actions
    openWindow: (appId: string, title: string, defaultSize?: { width: number; height: number }) => string;
    closeWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    restoreWindow: (windowId: string) => void;
    maximizeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
    updateWindowSize: (windowId: string, size: { width: number; height: number }) => void;
    getWindowsByApp: (appId: string) => WindowInstance[];
}

const generateId = () => `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getInitialPosition = (existingWindows: WindowInstance[]) => {
    const baseX = 80;
    const baseY = 60;
    const offset = existingWindows.length * 30;
    return { x: baseX + offset, y: baseY + offset };
};

export const useWindowStore = create<WindowStore>((set, get) => ({
    windows: [],
    activeWindowId: null,
    nextZIndex: 1,

    openWindow: (appId, title, defaultSize = { width: 800, height: 600 }) => {
        const { windows, nextZIndex } = get();
        const id = generateId();
        const position = getInitialPosition(windows);

        const newWindow: WindowInstance = {
            id,
            appId,
            title,
            state: 'open',
            position,
            size: defaultSize,
            zIndex: nextZIndex,
        };

        set({
            windows: [...windows, newWindow],
            activeWindowId: id,
            nextZIndex: nextZIndex + 1,
        });

        return id;
    },

    closeWindow: (windowId) => {
        set((state) => ({
            windows: state.windows.filter((w) => w.id !== windowId),
            activeWindowId: state.activeWindowId === windowId
                ? state.windows.find((w) => w.id !== windowId)?.id || null
                : state.activeWindowId,
        }));
    },

    minimizeWindow: (windowId) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId ? { ...w, state: 'minimized' as WindowState } : w
            ),
            activeWindowId: state.activeWindowId === windowId
                ? state.windows.find((w) => w.id !== windowId && w.state !== 'minimized')?.id || null
                : state.activeWindowId,
        }));
    },

    restoreWindow: (windowId) => {
        const { nextZIndex } = get();
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId ? { ...w, state: 'open' as WindowState, zIndex: nextZIndex } : w
            ),
            activeWindowId: windowId,
            nextZIndex: nextZIndex + 1,
        }));
    },

    maximizeWindow: (windowId) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId
                    ? { ...w, state: w.state === 'maximized' ? 'open' : 'maximized' as WindowState }
                    : w
            ),
        }));
    },

    focusWindow: (windowId) => {
        const { nextZIndex, windows } = get();
        const targetWindow = windows.find((w) => w.id === windowId);

        if (!targetWindow || targetWindow.state === 'minimized') return;

        set({
            windows: windows.map((w) =>
                w.id === windowId ? { ...w, zIndex: nextZIndex } : w
            ),
            activeWindowId: windowId,
            nextZIndex: nextZIndex + 1,
        });
    },

    updateWindowPosition: (windowId, position) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId ? { ...w, position } : w
            ),
        }));
    },

    updateWindowSize: (windowId, size) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId ? { ...w, size } : w
            ),
        }));
    },

    getWindowsByApp: (appId) => {
        return get().windows.filter((w) => w.appId === appId);
    },
}));
