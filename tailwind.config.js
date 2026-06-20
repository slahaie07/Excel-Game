/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aether: {
          50: "#f5f0ff",
          100: "#ede5ff",
          200: "#dccfff",
          300: "#c4a8ff",
          400: "#a875ff",
          500: "#8b3dff",
          600: "#7c1af5",
          700: "#6b12d8",
          800: "#5911b0",
          900: "#4a1090",
          950: "#1a0f2e",
        },
        crystal: {
          cyan: "#00e5ff",
          gold: "#ffd700",
          ember: "#ff6b35",
        },
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
