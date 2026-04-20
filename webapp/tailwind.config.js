/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0b0e14",
          1: "#11151c",
          2: "#1a1f29",
        },
        line: "#2a3140",
        muted: "#8b94a7",
        accent: "#5eead4",
      },
    },
  },
  plugins: [],
};
