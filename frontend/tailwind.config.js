/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          dark: '#5849C7',
          light: '#A29BFE',
        },
        secondary: '#00D4AA',
        danger: '#FF6B6B',
        warning: '#FFA502',
        success: '#26DE81',
        dark: {
          100: '#252547',
          200: '#1A1A3E',
          300: '#0F0F23',
        }
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}