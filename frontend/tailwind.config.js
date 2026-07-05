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
        brand: {
          50: '#fbf2ff',
          100: '#f5e0ff',
          200: '#eac2ff',
          300: '#d89bff',
          400: '#c473ff',
          500: '#a74be8',
          600: '#8b2fd4',
          700: '#6f27b0',
          800: '#562086',
          900: '#40175f',
          950: '#2c0f3f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
