import { create } from 'zustand';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastStore {
    toasts: Toast[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    showToast: (message, type = 'success') => {
        const id = Date.now().toString();
        set((state) => ({
            toasts: [...state.toasts, { id, message, type }],
        }));

        // Auto-remove after 3 seconds
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, 3000);
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));
