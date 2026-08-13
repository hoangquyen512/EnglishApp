/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stone: {
          25: "#faf6f1",
          50: "#f4eee6",
          100: "#e8dfd4",
          500: "#5c524a",
          800: "#3d322b",
          950: "#1f1915",
        },
        terracotta: {
          500: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
        },
        pet: {
          bg: "#faf6f1",
          card: "#ffffff",
          ink: "#1f1915",
          accent: "#c2410c",
          muted: "#5c524a",
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
