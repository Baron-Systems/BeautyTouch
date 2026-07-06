/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A227',
          light: '#D4B84A',
          dark: '#B08D1F',
          50: '#FCF9EE',
          100: '#F7F0D6',
          200: '#EFE1AD',
          300: '#E5CE7E',
          400: '#D4B84A',
          500: '#C9A227',
          600: '#B08D1F',
          700: '#8A6E18',
          800: '#634F11',
          900: '#3D310A',
        },
        black: {
          DEFAULT: '#111111',
          light: '#555555',
        },
      },
      fontFamily: {
        arabic: ['"Cairo"', 'sans-serif'],
        sans: ['Inter', '"Cairo"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'gold': '0 4px 24px rgba(201, 162, 39, 0.2)',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
