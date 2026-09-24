import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0faf4",
          100: "#dcf5e7",
          200: "#b9ebd0",
          300: "#86dcad",
          400: "#4cc584",
          500: "#27aa66",
          600: "#027b39", // EYGII Primary Brand Green
          700: "#02632f",
          800: "#044e27",
          900: "#054122",
          950: "#012411",
        },
        dark: {
          950: "#02160b",
          900: "#031c0e", // Deep green / near-black background
          850: "#062915",
          800: "#09381e",
          700: "#0e4b2a",
        },
        neutral: {
          50: "#f8faf7",
          100: "#f0f4f1",
          200: "#e1e8e3",
          300: "#cbd6cf",
          400: "#9eb1a4",
          500: "#768c7d",
          600: "#596e60",
          700: "#46574c",
          800: "#39463e",
          900: "#303a34",
          950: "#1a211d",
        },
        accentGold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(2,123,57,0.06)",
        "card-hover": "0 8px 30px rgba(2,123,57,0.12), 0 2px 6px rgba(0,0,0,0.06)",
        button: "0 2px 8px rgba(2, 123, 57, 0.25)",
        "button-hover": "0 6px 20px rgba(2, 123, 57, 0.35)",
        subtle: "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "slide-up": "slide-up 0.4s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
