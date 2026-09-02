/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  mode: "jit",
  theme: {
    fontFamily: {
      Roboto: ["Roboto", "sans-serif"],
      Poppins: ["Poppins", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          // Primary — Deep Indigo / Royal Blue (Vendora brand)
          DEFAULT: "#4f46e5",
          light: "#6366f1",
          dark: "#4338ca",
          darker: "#3730a3",
          soft: "#eef2ff",
        },
        violet: {
          SOFT: "#8b5cf6",
        },
        success: {
          DEFAULT: "#16a34a",
          soft: "#ecfdf5",
        },
        warning: {
          DEFAULT: "#f59e0b",
          soft: "#fffbeb",
        },
        errorred: {
          DEFAULT: "#dc2626",
          soft: "#fef2f2",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f6f5",
          soft: "#f9fafb",
        },
        ink: {
          DEFAULT: "#0f172a",
          soft: "#475569",
          faint: "#94a3b8",
        },
        line: "#e5e7eb",
      },
      screens: {
        "1000px": "1050px",
        "1100px": "1110px",
        "800px": "800px",
        "1300px": "1300px",
        "400px": "400px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)",
        "card-hover":
          "0 8px 24px -6px rgba(79, 70, 229, 0.12), 0 4px 12px -4px rgba(0,0,0,0.08)",
        pop: "0 10px 40px -8px rgba(15,23,42,0.18)",
      },
      transitionTimingFunction: {
        smoth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

