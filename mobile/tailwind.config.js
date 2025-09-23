/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#22c55e',
          red: '#ef4444',
          dark: '#1f2937',
          gold: '#fbbf24',
        }
      }
    },
  },
  plugins: [],
}

