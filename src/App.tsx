import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useAuthListener } from './hooks/useAuthListener';
import { LoginPage } from './components/Auth/LoginPage';
import { Desktop } from './components/Desktop/Desktop';

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-sage-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sage-400 to-sage-500 rounded-2xl rotate-3 opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-sage-300 to-sage-400 rounded-2xl -rotate-3 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-white animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                </div>
            </div>
            <p className="text-charcoal-500">Loading Mental Clarity OS...</p>
        </div>
    </div>
);

const App: React.FC = () => {
    // Initialize auth listener once at the top level
    useAuthListener();

    const { isAuthenticated, isInitialized, isLoading } = useAuth();

    // Show loading screen while initializing auth
    if (!isInitialized || isLoading) {
        return <LoadingScreen />;
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // Show desktop if authenticated
    return <Desktop />;
};

export default App;
