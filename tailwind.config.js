/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#F5F3FF",
        muted: "#9EA3C7",
        cream: "#0B1020",
        paper: "#1A1640",
        clay: "#8B5CF6",
        "clay-dark": "#7C3AED",
        leaf: "#34D399",
        rose: "#FB7185",
        line: "#3D3568",
        stone: {
          25: "#0B1020",
          50: "#12162E",
          100: "#2A2458",
          500: "#9EA3C7",
          800: "#CFC7F8",
          950: "#F5F3FF",
        },
        terracotta: {
          500: "#A78BFA",
          700: "#8B5CF6",
          800: "#7C3AED",
        },
        cosmic: {
          base: "#0B1020",
          mid: "#0E1330",
          deep: "#15143A",
          surface: "#221A4A",
          primary: "#8B5CF6",
          "primary-2": "#A78BFA",
          pink: "#D48CFF",
          warm: "#F5B56B",
          fg: "#F5F3FF",
          sub: "#CFC7F8",
          muted: "#9EA3C7",
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "ui-sans-serif", "system-ui", "sans-serif"],
        specimen: ["Fraunces", "Georgia", "serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 12px 40px rgb(3 5 26 / 0.45), 0 0 0 1px rgb(170 140 255 / 0.12)",
        glow: "0 0 24px rgb(139 92 246 / 0.35)",
      },
      borderRadius: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
