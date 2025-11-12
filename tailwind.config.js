/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-purple': '#6B5B95',
        'clay-tan': '#8B7355',
        'clay-cream': '#F5F1E8',
        'clay-light': '#E8DCC8',
      },
    },
  },
  plugins: [],
}

