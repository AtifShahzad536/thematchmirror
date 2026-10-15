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
        ide: {
          bg: '#05080b',
          surface: '#070b0f',
          panel: '#090e12',
          card: '#0c1217',
          elevated: '#111820',
          border: '#17242f',
          borderLight: '#213342',
          cyan: '#00f0ff',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          textMuted: '#688091',
          textDark: '#435866',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(0, 240, 255, 0.25)',
        'cyan-sm': '0 0 8px rgba(0, 240, 255, 0.2)',
        'green-glow': '0 0 12px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
};
