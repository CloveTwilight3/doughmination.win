module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // This enables the class-based dark mode toggle
  theme: {
    extend: {
      colors: {
        // Customize colors if needed
        primary: '#1a202c', // Example of a primary color for dark mode
        secondary: '#edf2f7', // Example of secondary color
      },
    },
  },
  plugins: [],
};