/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        herb: {
          background: '#F5F6E7',
          surface: '#F0F8EA',
          accentSurface: '#C6CEC9',
          primary: '#2B4D3F',
          primaryDark: '#446835',
          secondary: '#DAE5D8',
          textPrimary: '#22332B',
          textSecondary: '#4A5351',
          divider: '#E5E6E4',
          error: '#F28C0F',
          card: '#FFFFFF',
          success: '#008000',
          muted: '#5F6F64',

        }
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
