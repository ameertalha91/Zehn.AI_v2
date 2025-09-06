
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { 
        primary: "#14b8a6", // teal-500
        secondary: "#8b5cf6", // purple-500
        accent: "#06b6d4", // cyan-500
        ink: "#111827", // gray-900
        subtle: "#f9fafb", // gray-50
        'teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a'
        }
      },
      borderRadius: { 
        '2xl': '1rem',
        'xl': '0.75rem'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
};
