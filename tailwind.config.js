/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vmc: {
          bg: {
            primary: '#0b0f17',
            secondary: '#111827',
            tertiary: '#1f2937',
          },
          surface: {
            DEFAULT: '#131b2e',
            card: 'rgba(19, 27, 46, 0.9)',
            input: 'rgba(15, 23, 42, 0.75)',
          },
          border: {
            DEFAULT: '#1e293b',
            hover: '#334155',
            focus: '#3b82f6',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            muted: '#64748b',
          },
          accent: {
            blue: '#3b82f6',
            indigo: '#6366f1',
            cyan: '#22d3ee',
            emerald: '#34d399',
            amber: '#fbbf24',
            rose: '#fb7185',
            purple: '#a78bfa',
          },
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.22)',
        'glow-indigo': '0 0 30px rgba(99, 102, 241, 0.22)',
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease-in-out forwards',
      },
      keyframes: {
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
