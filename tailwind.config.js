/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Cutive Mono"', 'monospace'],
      },
      colors: {
        cream: '#F5F0E8',
        ink: '#0D0D0D',
        red: '#C8372D',
        muted: '#8A8579',
      },
    },
  },
  plugins: [],
}
