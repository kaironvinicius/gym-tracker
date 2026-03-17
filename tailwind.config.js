/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gym-bg': '#0a0a0a',
        'gym-surface': '#141414',
        'gym-card': '#1a1a1a',
        'gym-border': '#2a2a2a',
        'gym-accent': '#f97316',
        'gym-accent-dark': '#ea6c0a',
        'gym-green': '#22c55e',
        'gym-red': '#ef4444',
        'gym-yellow': '#eab308',
        'gym-text': '#f5f5f5',
        'gym-muted': '#737373',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
