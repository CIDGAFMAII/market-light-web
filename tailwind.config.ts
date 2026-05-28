import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
        mono: ["var(--font-share-tech)", "Share Tech Mono", "monospace"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        cyan: "var(--cyan)",
        pink: "var(--pink)",
        yellow: "var(--yellow)",
        mlgreen: "var(--green)",
        mlred: "var(--red)",
        muted: "var(--muted)",
      },
      boxShadow: {
        cyan: "0 0 28px rgba(0, 255, 255, 0.18)",
        pink: "0 0 28px rgba(255, 0, 255, 0.16)",
        yellow: "0 0 24px rgba(250, 204, 21, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
