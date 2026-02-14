/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          card: '#282828',
          text: '#ffffff',
          sub: '#a0a0a0'
        },
        brand: {
          yellow: '#ffa116',
          darkYellow: '#d68f1f'
        }
      }
    },
  },
  plugins: [],
}
