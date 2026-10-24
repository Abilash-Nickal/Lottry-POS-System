/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        // Major / Primary: Vibrant POS Orange (Current UI)
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316', // Major Primary Orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          DEFAULT: '#F97316',
        },
        // Figma Design System Tokens
        terracotta: {
          50: '#FDF2F0',
          100: '#FCE4E1',
          200: '#F9C9C2',
          300: '#F5A99E',
          400: '#EE7866',
          500: '#D64933', // Figma Primary #D64933
          600: '#BE3823',
          700: '#9E2A18',
          800: '#7D2012',
          900: '#52160C',
          DEFAULT: '#D64933',
        },
        secondary: {
          50: '#FDF8F5',
          100: '#FAF0E9',
          200: '#F4DEC9',
          300: '#EBC3A4',
          400: '#E0A37D',
          500: '#D68A64', // Figma Secondary #D68A64
          600: '#BA6E47',
          700: '#945332',
          800: '#6E3A20',
          900: '#482413',
          DEFAULT: '#D68A64',
        },
        tertiary: {
          50: '#FDF9F7',
          100: '#F9F1ED',
          200: '#F3E0D8',
          300: '#EBCCC0',
          400: '#E7BEAD',
          500: '#E3B39E', // Figma Tertiary #E3B39E
          600: '#C69480',
          700: '#A47360',
          800: '#7C5243',
          900: '#52342A',
          DEFAULT: '#E3B39E',
        },
        neutral: {
          50: '#FAF8F6',
          100: '#F5F1EC',
          200: '#E6DDD4', // Figma Neutral #E6DDD4
          300: '#D6CABE',
          400: '#BDB0A3',
          500: '#9F9184',
          600: '#7F7266',
          700: '#61564C',
          800: '#423A34',
          900: '#26201D', // Figma Dark / Inverted
          DEFAULT: '#E6DDD4',
        },
        fDark: '#26201D', // Figma Inverted / Dark button color
        canvas: '#FAF7F0',
        cream: {
          50: '#FCFBF7',
          100: '#FAF7F0',
          200: '#F4EFE2',
          300: '#EDE4D0',
          400: '#E0D3B8'
        },
        onyx: {
          950: '#111113',
          900: '#141416',
          850: '#18181B',
          800: '#202024',
          700: '#27272A'
        },
        brand: {
          sidebar: '#18181B',
          sidebarDark: '#141416',
          accent: '#F97316',
          accentHover: '#EA580C',
          pill: '#FAF7F0'
        }
      }
    },
  },
  plugins: [],
}
