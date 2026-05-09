/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          light: '#f3f3f3',
          DEFAULT: '#232f3e',
          dark: '#131921',
          yellow: '#febd69',
          orange: '#f3a847',
        },
        primary: '#d4af37', // Or Dango
        secondary: '#232f3e',
        bg: '#eaeded', // Gris clair Amazon
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
