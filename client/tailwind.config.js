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
          wine: '#201215',       // Primary deep burgundy / wine ground
          wineDark: '#170c0e',   // Deepest background
          wineCard: '#2c181c',   // Elevated card wine
          wineHover: '#381e23',  // Interactive hover wine
          wineBorder: '#4a282f', // Subtle borders
          lime: '#CCFF00',       // Vivid lime neon accent
          limeHover: '#bbf000',  // Lime button hover
          limeGlow: 'rgba(204, 255, 0, 0.15)',
          ivory: '#FAF7F2',      // Warm white / ivory secondary background
          ivoryMuted: '#E5E0D8',
          coral: '#FF5E36',      // Energetic coral secondary accent
          dark: '#121212',
          surface: '#1c1517',
        }
      },
      fontFamily: {
        display: ['"Oswald"', '"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'lime-glow': '0 0 25px rgba(204, 255, 0, 0.35)',
        'wine-depth': '0 10px 30px -10px rgba(10, 4, 6, 0.7)',
      }
    },
  },
  plugins: [],
}
