/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Navy (Trust, Professionalism)
        'primary': {
          DEFAULT: '#1e3a5f',
          light: '#2d5a87',
          dark: '#0f2744',
        },
        // Accent - Warm Orange (Energy, Iberian warmth)
        'accent': {
          DEFAULT: '#e85d04',
          light: '#f48c06',
          dark: '#c44200',
        },
        // Neutral - Warm Grays
        'warm-gray': {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        // Light theme backgrounds
        'bg-light': '#ffffff',
        'bg-alt': '#f8fafc',
        'bg-card': '#ffffff',
        // Status colors
        'success': '#059669',
        'warning': '#d97706',
        'error': '#dc2626',
        // Legacy colors (keep for compatibility)
        'ibero-red': '#AA151B',
        'ibero-yellow': '#F1BF00',
        'ibero-orange': '#FF6B35',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['1.5rem', { lineHeight: '1.4' }],
        'body': ['1.125rem', { lineHeight: '1.7' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        'gradient-accent': 'linear-gradient(135deg, #e85d04 0%, #f48c06 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04)',
        'accent': '0 4px 14px rgba(232, 93, 4, 0.25)',
        'accent-lg': '0 6px 20px rgba(232, 93, 4, 0.3)',
      },
    },
  },
  plugins: [],
}
