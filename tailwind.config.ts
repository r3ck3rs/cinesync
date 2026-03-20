import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f0ff",
          100: "#e8e2ff",
          400: "#9b8ef7",
          500: "#7c6ff7",
          600: "#6457e8",
          700: "#4d3fd9",
          900: "#1a1360",
        },
        surface: {
          DEFAULT: "#0e0e1b",
          elevated: "#151524",
          overlay: "#1b1b30",
        },
        cinema: {
          bg: "#080811",
          muted: "#68688a",
          subtle: "#353552",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7c6ff7 0%, #ec4899 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-poster": "linear-gradient(to top, rgba(8,8,17,0.95) 0%, transparent 60%)",
      },
      keyframes: {
        "scale-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "scale-in": "scale-in 0.15s ease-out",
        "fade-up": "fade-up 0.3s ease-out",
        "pop": "pop 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
