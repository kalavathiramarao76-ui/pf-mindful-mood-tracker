use client;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3498db",
        secondary: "#f1c40f",
        accent: "#e74c3c",
        dark: "#2c3e50",
        light: "#ecf0f1",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#333",
            a: {
              color: "#3498db",
              "&:hover": {
                color: "#2980b9",
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};