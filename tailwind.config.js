/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on 'dark' class
  theme: {
    extend: {
      colors: {
        // Brand colors (from Design Direction: warm neutral, ink, violet/indigo accent)
        // Light theme defaults
        'bg-base': '#fdfcfb',
        'bg-secondary': '#f4f3ec',
        'text-ink': '#2c2c34',
        'text-secondary': '#6b6375',
        'accent-main': '#8B5CF6', // A violet/indigo
        'accent-light': '#C4B5FD',
        'border-base': '#e5e4e7',
        
        // Semantic colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Primary sans-serif font
        heading: ['Playfair Display', 'serif'], // Heading serif font
      },
    },
  },
  plugins: [],
}