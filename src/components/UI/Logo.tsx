import React from 'react';

interface LogoProps {
    className?: string;
    animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", animated = false }) => {
    return (
        <div className={`${className} relative flex items-center justify-center`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`w-full h-full ${animated ? 'animate-float-slow' : ''}`}
            >
                {/* Bubble 1 (Bottom Left) */}
                <circle cx="35" cy="65" r="25" fill="url(#grad1)" className="opacity-90 mix-blend-multiply" />
                {/* Bubble 2 (Top) */}
                <circle cx="50" cy="35" r="25" fill="url(#grad2)" className="opacity-90 mix-blend-multiply" />
                {/* Bubble 3 (Bottom Right) */}
                <circle cx="65" cy="65" r="25" fill="url(#grad3)" className="opacity-90 mix-blend-multiply" />

                <defs>
                    <radialGradient id="grad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(35 65) rotate(90) scale(25)">
                        <stop stopColor="#A5F3FC" />
                        <stop offset="1" stopColor="#0891B2" stopOpacity="0.6" />
                    </radialGradient>
                    <radialGradient id="grad2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 35) rotate(90) scale(25)">
                        <stop stopColor="#DDD6FE" />
                        <stop offset="1" stopColor="#7C3AED" stopOpacity="0.6" />
                    </radialGradient>
                    <radialGradient id="grad3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(65 65) rotate(90) scale(25)">
                        <stop stopColor="#FDE68A" />
                        <stop offset="1" stopColor="#D97706" stopOpacity="0.6" />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    );
};
