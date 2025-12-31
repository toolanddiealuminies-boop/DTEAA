/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A8754', // Forest Green
          hover: '#06643F',
          disabled: '#9AD7C0', // lighter green for disabled
        },
        secondary: {
          DEFAULT: '#38BDF8', // Sky Blue
          hover: '#0EA5E9',
        },
        dark: {
          bg: '#111413',
          card: '#1A1C1A',
          border: '#2B2D2A',
          text: {
            primary: '#E5E5E5',
            secondary: '#BBBBBB',
          }
        },
        light: {
          bg: '#FAFBF9',
          card: '#FFFFFF',
          border: '#E4E6E3',
          text: {
            primary: '#111111',
            secondary: '#444444',
          }
        },
        success: {
          light: '#16A34A',
          dark: '#22C55E',
        },
        warning: {
          light: '#F59E0B',
          dark: '#FBBF24',
        },
        error: {
          light: '#DC2626',
          dark: '#F87171',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
