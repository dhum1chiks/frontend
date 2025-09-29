/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e', // Tailwind green-500
        accent: '#ffffff', // White
        sidebar: '#14532d', // Dark green
        card: '#e6f4ea', // Light green
        text: '#14532d', // Dark green text
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(34,197,94,0.15)',
      },
    },
  },
  plugins: [],
}
