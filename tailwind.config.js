/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---- Surfaces (dark-first B2B palette anchored on #0F172A) ----
        canvas: {
          DEFAULT: '#0F172A',
          deep: '#0A1120',
          raised: '#141F38',
          overlay: '#1B2942',
        },
        hairline: {
          DEFAULT: 'rgba(148, 163, 184, 0.14)',
          strong: 'rgba(148, 163, 184, 0.26)',
        },
        // ---- FoliVision Emerald Green ----
        emerald_brand: {
          50: '#E8F5EE',
          100: '#C5E6D3',
          200: '#9DD5B6',
          300: '#6FC395',
          400: '#40AF74',
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
          400: '#FBBE50',
          500: '#FBB040',
          600: '#E09528',
          700: '#B8741A',
          800: '#8A5511',
          900: '#5C3809',
        },
        // ---- Accessible muted text ----
        // Tailwind's slate-500/600 fail WCAG AA on our dark surfaces
        // (3.44:1 and 2.16:1). These are solved to clear 4.5:1 on the
        // lightest surface the portal uses (#141F38).
        muted: {
          DEFAULT: '#7E899A', // 4.62:1 on canvas-raised
          soft: '#8E99AC',    // 5.69:1 on canvas-raised
        },
        // ---- VybzTech accent (portal chrome / provider identity) ----
        vybz: {
          400: '#7DA2FF',
          500: '#4E7DF5',
          600: '#3A63D0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.28), 0 8px 24px -12px rgba(0,0,0,0.55)',
        lift: '0 4px 12px rgba(0,0,0,0.32), 0 18px 44px -20px rgba(0,0,0,0.65)',
        'glow-emerald': '0 0 0 1px rgba(0,104,55,0.4), 0 8px 28px -10px rgba(0,104,55,0.55)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
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
