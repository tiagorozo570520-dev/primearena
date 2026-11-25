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
        titans: {
          black: "#050508",
          dark: "#0a0b12",
          navy: "#0f1220",
          blue: "#00d4ff",
          cyan: "#00f0ff",
          violet: "#8b5cf6",
          gold: "#f5c542",
          silver: "#c0c7d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 212, 255, 0.25)",
        "glow-lg": "0 0 40px rgba(0, 212, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
