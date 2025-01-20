/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // Blue
        secondary: '#7F1D1D', // Red
        accent: '#FBBF24', // Yellow
        neutral: '#F3F4F6', // Light Gray
        dark: '#1F2937', // Dark Gray
        background: '#111827', // Dark Black
        text: '#E5E7EB', // Light Text
        success: '#10B981', // Green
        error: '#EF4444', // Red
      },
    },
  },
  plugins: [],
}
