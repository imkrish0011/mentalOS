/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Calm, neutral color palette
                cream: {
                    50: '#FEFDFB',
                    100: '#FAF9F6',
                    200: '#F5F3EF',
                },
                sage: {
                    50: '#F4F7F5',
                    100: '#E8EFEA',
                    200: '#D1DFD6',
                    300: '#A8C4B0',
                    400: '#7C9885',
                    500: '#5A7A64',
                    600: '#466250',
                    700: '#3A5042',
                    800: '#314338',
                    900: '#2A3830',
                },
                ocean: {
                    50: '#F5F8FA',
                    100: '#EBF1F5',
                    200: '#D6E3EB',
                    300: '#B3CCDB',
                    400: '#8BA4B4',
                    500: '#6B8899',
                    600: '#567080',
                    700: '#475C69',
                    800: '#3E4F59',
                    900: '#37444C',
                },
                charcoal: {
                    50: '#F6F7F8',
                    100: '#E3E6E8',
                    200: '#C7CDD1',
                    300: '#A3ADB5',
                    400: '#778691',
                    500: '#5C6B77',
                    600: '#4F5C65',
                    700: '#444E55',
                    800: '#3C4349',
                    900: '#2C3E50',
                },
                terracotta: {
                    50: '#FBF8F5',
                    100: '#F7F0E8',
                    200: '#EDDDD0',
                    300: '#E0C5AF',
                    400: '#C4A484',
                    500: '#B08A66',
                    600: '#9A7355',
                    700: '#7F5D46',
                    800: '#6A4E3D',
                    900: '#5A4235',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'window': '0 8px 30px rgba(0, 0, 0, 0.12)',
                'dock': '0 -4px 20px rgba(0, 0, 0, 0.08)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'fade-in-long': 'fadeIn 2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
