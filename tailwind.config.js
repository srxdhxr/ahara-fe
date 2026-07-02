/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: "#6B5B95",
          deep: "#5A4A85",
        },
        brown: "#8B7355",
        cream: "#FAFAF9",
        lavender: "#F5F3FF",
        ink: "#1A1A1A",
      },
      fontFamily: {
        pixel: ["Silkscreen", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0 #1A1A1A",
        "pixel-sm": "2px 2px 0 #1A1A1A",
        "pixel-lg": "6px 6px 0 #1A1A1A",
      },
    },
  },
  plugins: [],
};
