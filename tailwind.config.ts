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
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
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
        cyan: "0 18px 45px rgba(99, 102, 241, 0.12)",
        pink: "0 18px 45px rgba(139, 92, 246, 0.12)",
        yellow: "0 18px 45px rgba(250, 204, 21, 0.08)",
        soft: "var(--shadow-soft)",
        indigo: "var(--shadow-indigo)",
      },
    },
  },
  plugins: [],
};

export default config;
