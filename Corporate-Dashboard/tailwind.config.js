/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        es: {
          black: '#0A0E1A',
          navy: '#0F1629',
          'navy-mid': '#161D35',
          'navy-light': '#1E2847',
          teal: '#00C896',
          'teal-dim': '#00A07A',
          amber: '#F59E0B',
          red: '#EF4444',
          purple: '#8B5CF6',
          blue: '#3B82F6',
          'text-primary': '#F1F5F9',
          'text-secondary': '#94A3B8',
          'text-muted': '#475569',
        },
      },
    },
  },
  plugins: [],
}