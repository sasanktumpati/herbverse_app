/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        herb: {
          background: '#F0F8EA',
          surface: '#F0F8EA',
          accentSurface: '#C6CEC9',
          primary: '#2B4D3F',
          primaryDark: '#08402b',
          secondary: '#DAE5D8',
          textPrimary: '#22332B',
          textSecondary: '#4A5351',
          divider: '#E5E6E4',
          error: '#F28C0F',
          card: '#FFFFFF',
          success: '#008000',
          muted: '#5F6F64',
        }
      },
      fontFamily: {
        poppins: ['Poppins_400Regular', 'sans-serif'],
        'poppins-light': ['Poppins_300Light', 'sans-serif'],
        'poppins-regular': ['Poppins_400Regular', 'sans-serif'],
        'poppins-medium': ['Poppins_500Medium', 'sans-serif'],
        'poppins-semibold': ['Poppins_600SemiBold', 'sans-serif'],
        'poppins-bold': ['Poppins_700Bold', 'sans-serif'],
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
