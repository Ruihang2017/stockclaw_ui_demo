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
        charcoal: {
          950: '#0d0f12',
          900: '#14171c',
          800: '#1a1e26',
          700: '#22262f',
          600: '#2a2f3a',
        },
        accent: {
          gold: '#c9a227',
          'gold-muted': '#8b7a3d',
        },
        bullish: '#22c55e',
        bearish: '#ef4444',
        breaking: '#f97316',
        neutral: '#64748b',
        system: '#3b82f6',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
      },
      boxShadow: {
        'panel': '0 1px 2px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
