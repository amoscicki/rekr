import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        border: "var(--border)",
        input: "var(--border)",
        background: "var(--background)",
        foreground: "var(--text-primary)",
        secondary: {
          DEFAULT: "var(--background-secondary)",
          foreground: "var(--text-secondary)",
        },
        destructive: {
          DEFAULT: "rgb(239 68 68)",
          foreground: "var(--primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--background-secondary)",
          foreground: "var(--text-primary)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
