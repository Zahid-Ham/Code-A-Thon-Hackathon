/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'void-bg': '#050505',
        'holo-cyan': '#00F0FF',
        'nebula-purple': '#7000FF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        header: ['Rajdhani', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
