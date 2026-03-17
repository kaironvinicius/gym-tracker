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
        'gym-bg': 'var(--gym-bg)',
        'gym-surface': 'var(--gym-surface)',
        'gym-card': 'rgb(var(--gym-card) / <alpha-value>)',
        'gym-border': 'rgb(var(--gym-border) / <alpha-value>)',
        'gym-accent': 'rgb(var(--gym-accent) / <alpha-value>)',
        'gym-accent-dark': 'rgb(var(--gym-accent-dark) / <alpha-value>)',
        'gym-green': '#22c55e',
        'gym-red': '#ef4444',
        'gym-yellow': '#eab308',
        'gym-text': 'var(--gym-text)',
        'gym-muted': 'var(--gym-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
