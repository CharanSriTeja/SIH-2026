/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          surface: '#ECE7DC',
          paper: '#FFFFFF',
          raised: '#FFFFFF',
          subtle: '#DFD8CA',
          divider: '#BCB29E',
          border: '#C9C0AD',
        },
        brand: {
          DEFAULT: '#1E4B33',
          primary: '#1E4B33',
          dark: '#143524',
          light: '#EBF4EE',
          border: '#9EC4AF',
        },
        accent: {
          terracotta: '#B5551F',
          dark: '#964214',
          light: '#FDF1EB',
        },
        risk: {
          low: { DEFAULT: '#3E7B49', bg: '#EAF4EC', border: '#A8D9B2', text: '#1E4A26' },
          moderate: { DEFAULT: '#B87217', bg: '#FDF4E6', border: '#F0CE91', text: '#694008' },
          high: { DEFAULT: '#BD5015', bg: '#FDF0E8', border: '#F2BCA0', text: '#732C05' },
          critical: { DEFAULT: '#8A2418', bg: '#FCEEEB', border: '#EABEB7', text: '#5C170F' },
        },
        text: {
          primary: '#141712',
          secondary: '#474C3F',
          subtle: '#6B7263',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Source Serif 4', 'Georgia', 'serif'],
        sans: ['Inter', 'Public Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'paper-sm': '0 1px 2px 0 rgba(35, 38, 31, 0.05)',
        'paper': '0 1px 3px 0 rgba(35, 38, 31, 0.08), 0 1px 2px -1px rgba(35, 38, 31, 0.08)',
        'paper-md': '0 4px 6px -1px rgba(35, 38, 31, 0.08), 0 2px 4px -2px rgba(35, 38, 31, 0.08)',
        'paper-lg': '0 10px 15px -3px rgba(35, 38, 31, 0.08), 0 4px 6px -4px rgba(35, 38, 31, 0.08)',
        'paper-xl': '0 20px 25px -5px rgba(35, 38, 31, 0.08), 0 8px 10px -6px rgba(35, 38, 31, 0.08)',
      },
      borderRadius: {
        'panel': '1rem',
        'card': '0.75rem',
      }
    },
  },
  plugins: [],
}
