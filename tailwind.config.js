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
            tertiary: '#1a2236',
            elevated: '#1e293b',
          },
          surface: {
            DEFAULT: '#131b2e',
            card: 'rgba(19, 27, 46, 0.9)',
            input: 'rgba(15, 23, 42, 0.75)',
            glass: 'rgba(17, 24, 39, 0.94)',
          },
          border: {
            DEFAULT: '#1e293b',
            hover: '#334155',
            focus: '#3b82f6',
            subtle: 'rgba(255,255,255,0.06)',
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            muted: '#64748b',
            dim: '#475569',
          },
          accent: {
            blue: '#3b82f6',
            indigo: '#6366f1',
            cyan: '#22d3ee',
            emerald: '#34d399',
            amber: '#fbbf24',
            rose: '#fb7185',
            purple: '#a78bfa',
            teal: '#2dd4bf',
            sky: '#38bdf8',
          },
          gradient: {
            primary: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
            accent: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
            hero: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #06b6d4 100%)',
          },
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xs': '0.375rem',
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        'full': '9999px',
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(59, 130, 246, 0.22)',
        'glow-indigo': '0 0 30px rgba(99, 102, 241, 0.22)',
        'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.22)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.45)',
        'elevated': '0 20px 40px -8px rgba(0, 0, 0, 0.55)',
        'glass': '0 8px 32px -8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },
      animation: {
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.2s ease-in-out forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
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
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
