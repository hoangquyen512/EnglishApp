/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pet: {
          bg: "#fff7ed",
          card: "#ffffff",
          ink: "#431407",
          accent: "#ea580c",
          muted: "#9a3412",
        },
      },
    },
  },
  plugins: [],
};
