/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'gray-900': '#121212',
        'gray-800': '#1E1E1E',
        'gray-700': '#2D2D2D',
        'gray-600': '#404040',
        'gray-400': '#A0A0A0',
        'blue-500': '#3b82f6',
        'blue-600': '#2563eb',
      },
    },
  },
  plugins: [],
}