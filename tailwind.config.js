/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: 'rgb(var(--c-forest-50) / <alpha-value>)',
          100: 'rgb(var(--c-forest-100) / <alpha-value>)',
          200: 'rgb(var(--c-forest-200) / <alpha-value>)',
          300: 'rgb(var(--c-forest-300) / <alpha-value>)',
          400: 'rgb(var(--c-forest-400) / <alpha-value>)',
          500: 'rgb(var(--c-forest-500) / <alpha-value>)',
          600: 'rgb(var(--c-forest-600) / <alpha-value>)',
          700: 'rgb(var(--c-forest-700) / <alpha-value>)',
          800: 'rgb(var(--c-forest-800) / <alpha-value>)',
          900: 'rgb(var(--c-forest-900) / <alpha-value>)',
        },
        cream: {
          50: 'rgb(var(--c-cream-50) / <alpha-value>)',
          100: 'rgb(var(--c-cream-100) / <alpha-value>)',
          200: 'rgb(var(--c-cream-200) / <alpha-value>)',
          300: 'rgb(var(--c-cream-300) / <alpha-value>)',
          400: 'rgb(var(--c-cream-400) / <alpha-value>)',
          500: 'rgb(var(--c-cream-500) / <alpha-value>)',
        },
        gold: {
          50: 'rgb(var(--c-gold-50) / <alpha-value>)',
          100: 'rgb(var(--c-gold-100) / <alpha-value>)',
          200: 'rgb(var(--c-gold-200) / <alpha-value>)',
          300: 'rgb(var(--c-gold-300) / <alpha-value>)',
          400: 'rgb(var(--c-gold-400) / <alpha-value>)',
          500: 'rgb(var(--c-gold-500) / <alpha-value>)',
          600: 'rgb(var(--c-gold-600) / <alpha-value>)',
          700: 'rgb(var(--c-gold-700) / <alpha-value>)',
          800: 'rgb(var(--c-gold-800) / <alpha-value>)',
          900: 'rgb(var(--c-gold-900) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
