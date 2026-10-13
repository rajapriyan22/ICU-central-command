/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        status: {
          available: '#10B981', // Green
          occupied: '#2563EB',  // Blue
          cleaning: '#F59E0B',  // Amber/Yellow
          maintenance: '#EF4444', // Red
        }
      }
    },
  },
  plugins: [],
}
