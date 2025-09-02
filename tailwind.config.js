
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { primary:"#4027FF", ink:"#0B0F1A", subtle:"#F6F7FB" },
      borderRadius:{ '2xl':'1rem' }
    },
  },
  plugins: [],
};
