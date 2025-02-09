/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#7F1D1D',
        accent: '#FBBF24',
        neutral: '#F3F4F6',
        dark: '#1F2937',
        background: '#111827',
        text: '#E5E7EB',
        success: '#10B981',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
};
