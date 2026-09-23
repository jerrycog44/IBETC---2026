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
          50: "#f0f4fd",
          100: "#dbe5fa",
          200: "#bdcff6",
          300: "#91b1f0",
          400: "#5e8be8",
          500: "#3965de",
          600: "#274ac4",
          700: "#1f39a0",
          800: "#1e3282",
          900: "#1d2c67",
          950: "#111a42",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        }
      },
    },
  },
  plugins: [],
};

export default config;
