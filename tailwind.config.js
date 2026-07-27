/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: "var(--transparent)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        quaternary: "var(--color-quaternary)",
        quinary: "var(--color-quinary)",
        light: "var(--color-light)",
        dark: "var(--color-dark)",
      },
      keyframes: {
        "check-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "check-circle": {
          "0%": { strokeDashoffset: "151" },
          "100%": { strokeDashoffset: "0" },
        },
        "check-tick": {
          "0%": { strokeDashoffset: "36" },
          "100%": { strokeDashoffset: "0" },
        },
        "check-ring": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        "check-pop": "check-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "check-circle": "check-circle 0.5s ease-out forwards",
        "check-tick": "check-tick 0.3s 0.35s ease-out forwards",
        "check-ring": "check-ring 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
