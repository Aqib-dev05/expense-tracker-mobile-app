/** Same design tokens as the web app (frontend/tailwind.config.js). */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Cobalt brand colour (kept separate from income green / expense rose, which only ever mean money)
        brand: {
          50: '#eef3ff', 100: '#dde7ff', 200: '#c0d1ff', 300: '#94b0ff', 400: '#6283fb',
          500: '#3f5df0', 600: '#2f45dc', 700: '#2735b8', 800: '#252f94', 900: '#232d75',
        },
        // Blue-tinted dark surfaces
        ink: { 950: '#0a0f1e', 900: '#101831', 800: '#1a2444', 700: '#27345c' },
      },
    },
  },
  plugins: [],
};
