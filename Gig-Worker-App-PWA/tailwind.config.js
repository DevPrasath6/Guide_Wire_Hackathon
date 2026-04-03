/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        es: {
          black: '#0A0E1A', navy: '#0F1629', navyMid: '#161D35', navyLight: '#1E2847',
          teal: '#00C896', tealDim: '#00A07A',
          amber: '#F59E0B', red: '#EF4444', purple: '#8B5CF6', blue: '#3B82F6',
          primary: '#F1F5F9', secondary: '#94A3B8', muted: '#475569',
        }
      },
      screens: { 'xs': '375px' }
    }
  },
  plugins: [],
}
