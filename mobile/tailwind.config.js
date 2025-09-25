/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Poker theme colors from PRD
        'poker-dark': '#1a1a1a',
        'poker-darker': '#0d0d0d',
        'poker-card': '#2d2d2d',
        'poker-card-light': '#3a3a3a',
        'poker-green': '#4ade80',
        'poker-green-dark': '#22c55e',
        'poker-red': '#ef4444',
        'poker-red-dark': '#dc2626',
        'poker-gold': '#fbbf24',
        'poker-gold-dark': '#f59e0b',
        'poker-blue': '#3b82f6',
        'poker-purple': '#8b5cf6',

        // Legacy support
        poker: {
          green: '#22c55e',
          red: '#ef4444',
          dark: '#1f2937',
          gold: '#fbbf24',
        },

        // Neutrals
        'poker-gray': {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        // Default system fonts for better performance
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'monospace'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'poker': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'poker-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}