/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
        brand: {
          orange: '#FF6B00',
          hover: '#E55E00',
          tint: '#FFF3EB',
        },
        secondary: '#232f3e',
        bg: '#eaeded', // Gris clair Amazon
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
