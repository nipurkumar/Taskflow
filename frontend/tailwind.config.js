/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        purple: { DEFAULT: "#7c3aed", light: "#a78bfa", dark: "#5b21b6" },
        blue: { DEFAULT: "#2563eb", light: "#60a5fa" },
        cyan: { DEFAULT: "#06b6d4", light: "#67e8f9" },
        pink: { DEFAULT: "#ec4899", light: "#f9a8d4" },
      },
      backdropBlur: { xs: "2px" },
      animation: {
        float: "float 12s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.3s ease",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
