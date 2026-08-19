/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',

    content: [
        './src/**/*.{js,jsx,ts,tsx}'
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif'
                ]
            },

            keyframes: {
                fadeInUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(24px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                },

                float: {
                    '0%, 100%': {
                        transform: 'translateY(0)'
                    },
                    '50%': {
                        transform: 'translateY(-10px)'
                    }
                },

                floatSlow: {
                    '0%, 100%': {
                        transform: 'translate3d(0, 0, 0)'
                    },
                    '50%': {
                        transform: 'translate3d(0, -16px, 0)'
                    }
                },

                glow: {
                    '0%, 100%': {
                        opacity: '0.25',
                        transform: 'scale(1)'
                    },
                    '50%': {
                        opacity: '0.55',
                        transform: 'scale(1.08)'
                    }
                },

                progress: {
                    '0%': {
                        transform: 'scaleX(0)',
                        transformOrigin: 'left'
                    },
                    '100%': {
                        transform: 'scaleX(1)',
                        transformOrigin: 'left'
                    }
                }
            },

            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out both',
                float: 'float 5s ease-in-out infinite',
                'float-slow': 'floatSlow 8s ease-in-out infinite',
                glow: 'glow 4s ease-in-out infinite',
                progress: 'progress 1.4s ease-out both'
            }
        }
    },

    plugins: []
};