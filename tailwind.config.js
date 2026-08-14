/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f1915",
        muted: "#5c524a",
        cream: "#faf6f1",
        paper: "#ffffff",
        clay: "#c2410c",
        "clay-dark": "#9a3412",
        leaf: "#3f6212",
        rose: "#be123c",
        line: "#e8dfd4",
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
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "ui-sans-serif", "system-ui", "sans-serif"],
        specimen: ["Fraunces", "Georgia", "serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgb(31 25 21 / 0.08)",
      },
    },
  },
  plugins: [],
};
