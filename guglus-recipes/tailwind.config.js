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
        // Light Mode
        primary: {
          DEFAULT: '#E07A5F',
          hover: '#C96A50',
        },
        background: '#FEFAE0',
        card: '#FFFFFF',
        'text-primary': '#2D3436',
        'text-secondary': '#636E72',
        border: '#E8E8E8',
        success: '#81B29A',

        // Dark Mode tokens (applied via dark:)
        dark: {
          primary: '#F2CC8F',
          'primary-hover': '#D4A96A',
          background: '#1A1A2E',
          card: '#16213E',
          'text-primary': '#EAEAEA',
          'text-secondary': '#A0A0A0',
          border: '#2A2A4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}