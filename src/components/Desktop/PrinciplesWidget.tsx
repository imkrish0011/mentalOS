import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPrinciples, Principle } from '../../lib/firestoreService';
import { Quote } from 'lucide-react';

export const PrinciplesWidget: React.FC = () => {
    const { user } = useAuth();
    const [principle, setPrinciple] = useState<Principle | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrinciples = async () => {
            if (!user) return;
            try {
                const data = await getPrinciples(user.uid);
                if (data.length > 0) {
                    // Pick a random principle
                    const random = data[Math.floor(Math.random() * data.length)];
                    setPrinciple(random);
                }
            } catch (error) {
                console.error("Failed to load principles widget", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrinciples();
    }, [user]);

    if (loading || !principle) return null;

    return (
        <div className="absolute top-1/3 right-10 md:right-20 max-w-sm pointer-events-none select-none z-0 animate-fade-in-long">
            <div className="text-right space-y-4 opacity-80 mix-blend-overlay hover:opacity-100 hover:mix-blend-normal transition-all duration-700">
                <Quote className="w-8 h-8 text-white/60 ml-auto mb-2" />
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight shadow-sm drop-shadow-lg">
                    {principle.title}
                </h3>
                {principle.description && (
                    <p className="text-white/90 text-lg font-light leading-relaxed drop-shadow-md">
                        {principle.description}
                    </p>
                )}
            </div>
        </div>
    );
};
