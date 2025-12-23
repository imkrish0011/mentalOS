import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../stores/toastStore';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
    const { toasts } = useToastStore();

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.type === 'success'
                                ? 'bg-sage-500 text-white'
                                : toast.type === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-charcoal-800 text-white'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                        {toast.type === 'info' && <Info className="w-5 h-5" />}
                        <span className="font-medium">{toast.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
