 /** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },

      animation: {
        blob: "blob 7s infinite",
      },

      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },

          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },

          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        },
      },

      backdropBlur: {
        xs: "2px",
      },

      boxShadow: {
        glow: "0 0 20px rgba(168, 85, 247, 0.5)",
      },
    },
  },

  plugins: [],
};