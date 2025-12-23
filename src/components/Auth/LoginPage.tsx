import React from 'react';
import { Target, Sprout, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
    const { signInWithGoogle, isLoading, error } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-sage-50 flex items-center justify-center p-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-sage-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ocean-200/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-terracotta-100/20 rounded-full blur-3xl" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md animate-fade-in">
                <div className="glass rounded-3xl p-8 md:p-12 shadow-window border border-white/50">
                    {/* Logo & Title */}
                    <div className="text-center mb-10">
                        {/* Calm Brain Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-sage-400 to-sage-500 rounded-2xl rotate-3 opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-br from-sage-300 to-sage-400 rounded-2xl -rotate-3 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-white"
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

                        <h1 className="font-display text-3xl md:text-4xl font-semibold text-charcoal-900 mb-3">
                            Mental Clarity OS
                        </h1>
                        <p className="text-charcoal-500 text-lg leading-relaxed">
                            A calm space for your goals, habits, and reflections
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-10">
                        {[
                            { icon: Target, text: 'Track goals without pressure' },
                            { icon: Sprout, text: 'Build habits with compassion' },
                            { icon: FileText, text: 'Journal for clarity' },
                            { icon: ShieldCheck, text: 'Your data stays private' },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-charcoal-600"
                            >
                                <feature.icon className="w-5 h-5 text-sage-600" />
                                <span className="text-sm">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-terracotta-50 border border-terracotta-200 rounded-xl text-terracotta-700 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Sign In Button */}
                    <button
                        onClick={signInWithGoogle}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-cream-50 
                     border border-charcoal-200 rounded-xl shadow-soft
                     text-charcoal-700 font-medium text-base
                     transition-all duration-200 hover:shadow-md
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-sage-300 focus:ring-offset-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-charcoal-300 border-t-sage-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                {/* Google Icon */}
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Footer Note */}
                    <p className="mt-8 text-center text-xs text-charcoal-400 leading-relaxed">
                        By signing in, you agree to keep your mental wellness journey personal and private.
                        Your data is stored securely and never shared.
                    </p>
                </div>

                {/* Bottom Tagline */}
                <p className="mt-6 text-center text-sm text-charcoal-400">
                    Designed for clarity, built with care
                </p>
            </div>
        </div>
    );
};
