/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Environment / Terrain Warm Neutral Palette
        earth: {
          50: '#FAF8F5',
          100: '#F6F3EC',
          200: '#EDE8DE',
          300: '#DDD6C4',
          400: '#BCB29E',
          500: '#9C917B',
          600: '#7A705B',
          700: '#5A5241',
          800: '#3D372B',
          900: '#23261F',
          surface: '#F6F3EC',   // Main background (warm off-white/paper)
          card: '#FFFDF8',      // Cards, panels, elevated surfaces
          panel: '#FFFDF8',
          paper: '#FFFDF8',
          subtle: '#EDE8DE',    // Neutral chip / code backgrounds
          border: '#DDD6C4',    // Dividers, card borders, separators
          divider: '#DDD6C4',
        },
        // Forest / Earth Brand
        brand: {
          50: '#F3F7F5',
          100: '#E8EFEA',
          200: '#D1DFD6',
          300: '#CAD7CE',
          400: '#6F9780',
          500: '#466F58',
          600: '#385A48',
          700: '#2E4A3D',
          800: '#23382E',
          900: '#17251F',
          DEFAULT: '#2E4A3D',   // Deep forest green primary
          primary: '#2E4A3D',
          hover: '#23382E',
          light: '#E8EFEA',     // Soft tint for icon containers and badges
          border: '#CAD7CE',
        },
        // Terracotta / Clay Accent
        accent: {
          50: '#FDF7F4',
          100: '#FDF1EB',
          200: '#F6C8B3',
          300: '#EDA27E',
          400: '#DF7C4A',
          500: '#D26027',
          600: '#C3561F',
          700: '#B5551F',
          800: '#9A4617',
          900: '#682E0E',
          DEFAULT: '#B5551F',   // Terracotta accent
          terracotta: '#B5551F',
          hover: '#9A4617',
          light: '#FDF1EB',
          border: '#F6C8B3',
        },
        // Standardized Risk Scale (Uniform across all pages)
        risk: {
          low: {
            DEFAULT: '#4F8F5B',
            bg: '#EEF7F0',
            border: '#C2E3C9',
            text: '#2D5D37',
          },
          moderate: {
            DEFAULT: '#C98A2C',
            bg: '#FDF6EB',
            border: '#F4DCB0',
            text: '#7A5215',
          },
          high: {
            DEFAULT: '#C9601F',
            bg: '#FDF0EB',
            border: '#F6C8B3',
            text: '#823B10',
          },
          critical: {
            DEFAULT: '#8A2418',
            bg: '#FCEEEB',
            border: '#EABEB7',
            text: '#5C170F',
          },
        },
        // Contrast-Verified Typography
        text: {
          primary: '#23261F',   // Dark charcoal (> 11:1 contrast on #F6F3EC)
          muted: '#55594C',     // Warm gray (> 4.8:1 contrast, WCAG AA verified)
          secondary: '#55594C',
          subtle: '#7B8071',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'h1': ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'card-flat': '0 1px 3px 0 rgba(35, 38, 31, 0.05)',
        'card-raised': '0 4px 16px -2px rgba(35, 38, 31, 0.08), 0 2px 4px -2px rgba(35, 38, 31, 0.04)',
        'card-hover': '0 12px 24px -4px rgba(35, 38, 31, 0.12)',
        'paper-sm': '0 1px 2px 0 rgba(35, 38, 31, 0.05)',
        'paper': '0 1px 3px 0 rgba(35, 38, 31, 0.08), 0 1px 2px -1px rgba(35, 38, 31, 0.08)',
        'paper-md': '0 4px 6px -1px rgba(35, 38, 31, 0.08), 0 2px 4px -2px rgba(35, 38, 31, 0.08)',
        'paper-lg': '0 10px 15px -3px rgba(35, 38, 31, 0.08), 0 4px 6px -4px rgba(35, 38, 31, 0.08)',
      },
      borderRadius: {
        'card': '1rem',
        'panel': '1.25rem',
      }
    },
  },
  plugins: [],
}
