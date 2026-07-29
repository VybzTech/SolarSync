/** @type {import('tailwindcss').Config} */

/* Semantic colours resolve through CSS variables so a single `.dark` class
   on <html> flips the entire palette. The <alpha-value> placeholder keeps
   Tailwind's opacity modifiers (bg-card/60) working. */
const surface = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: surface('page'),
        card: surface('card'),
        raised: surface('raised'),
        sunken: surface('sunken'),

        ink: {
          DEFAULT: surface('ink'),
          2: surface('ink-2'),
          3: surface('ink-3'),
        },

        line: {
          DEFAULT: surface('line'),
          2: surface('line-2'),
        },

        // ---- FoliVision Emerald Green ----
        brand: {
          50: '#E8F5EE',
          100: '#C5E6D3',
          200: '#9DD5B6',
          300: '#6FC395',
          400: '#2F9E68',
          500: '#0F8A4C',
          600: '#006837',
          700: '#005A2F',
          800: '#004826',
          900: '#00331B',
        },

        // ---- FoliVision Solar Orange ----
        solar: {
          50: '#FFF7E8',
          100: '#FEEAC4',
          200: '#FDDB9B',
          300: '#FCCB70',
          400: '#E8A22B',
          500: '#C8830F',
          600: '#A66B08',
          700: '#835305',
          800: '#5C3903',
          900: '#3D2502',
        },

        info: {
          300: '#7DA2FF',
          500: '#3A63D0',
          600: '#2B4CAA',
        },

        /* Theme-aware STATUS TEXT.
           Brand fills stay constant across themes, but text drawn in a brand
           colour cannot: #FBB040 on white is 1.8:1. These flip with the
           theme so every status label clears AA in both modes. */
        fg: {
          brand: surface('fg-brand'),
          warn: surface('fg-warn'),
          info: surface('fg-info'),
          danger: surface('fg-danger'),
          neutral: surface('ink-3'),
        },
        tint: {
          brand: surface('tint-brand'),
          warn: surface('tint-warn'),
          info: surface('tint-info'),
          danger: surface('tint-danger'),
          neutral: surface('tint-neutral'),
        },
      },

      fontFamily: {
        sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.03em' }],
      },

      boxShadow: {
        // Soft layered depth. Values come from CSS vars so each theme gets
        // its own shadow weight -- dark surfaces need denser shadows.
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
        pop: 'var(--shadow-pop)',
        inset: 'var(--shadow-inset)',
      },

      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
