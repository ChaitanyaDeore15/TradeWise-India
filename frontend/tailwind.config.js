/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tradewise: {
          bg: "#0B1220",
          surface: "#111C2E",
          subtle: "#162235",
          border: "#1E293B",
          accent: "#2DD4BF",
          accentHover: "#14B8A6",
          text: "#F1F5F9",
          muted: "#94A3B8",
          up: "#10B981",
          down: "#EF4444",
          warning: "#F59E0B"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    },
  },
  plugins: [],
}
