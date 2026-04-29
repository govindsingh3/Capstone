module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        primary: "#0F172A",
        secondary: "#3B82F6",
        accent: "#06B6D4",
        background: "#020617",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,0.2), 0 10px 30px rgba(59,130,246,0.25)",
        soft: "0 8px 24px rgba(2,6,23,0.35)",
      },
      backgroundImage: {
        "radial-shell": "radial-gradient(circle at 15% 15%, rgba(59,130,246,0.24), transparent 32%), radial-gradient(circle at 85% 5%, rgba(6,182,212,0.2), transparent 26%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.2), transparent 30%)",
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
