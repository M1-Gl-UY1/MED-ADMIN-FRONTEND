/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Premium / Luxe
        primary: {
          DEFAULT: '#1A1A2E',
          50: '#E8E8ED',
          100: '#D1D1DB',
          200: '#A3A3B7',
          300: '#757593',
          400: '#47476F',
          500: '#1A1A2E',
          600: '#151525',
          700: '#10101C',
          800: '#0B0B13',
          900: '#06060A',
        },
        secondary: {
          DEFAULT: '#C9A227',
          50: '#F9F3E0',
          100: '#F3E7C1',
          200: '#E7CF83',
          300: '#DBB745',
          400: '#C9A227',
          500: '#A6851F',
          600: '#836918',
          700: '#604D12',
          800: '#3D310B',
          900: '#1A1505',
        },
        accent: {
          DEFAULT: '#16213E',
          light: '#1F2E54',
          dark: '#0D1424',
        },
        background: {
          DEFAULT: '#F8F9FA',
          card: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1A1A2E',
          light: '#6C757D',
          muted: '#9CA3AF',
        },
        success: '#28A745',
        error: '#DC3545',
        warning: '#FFC107',
        info: '#17A2B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
