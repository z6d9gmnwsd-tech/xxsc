/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FBF8F3',
          100: '#F5E6D0',
          200: '#E0C9A8',
          300: '#C4A882',
          400: '#A68B6B',
          500: '#8B6914',
          600: '#5D4E37',
        },
        warm: {
          50: '#FBF8F3',
          100: '#F5E6D0',
          200: '#E0C9A8',
          300: '#C4A882',
          400: '#A68B6B',
          500: '#8B6914',
          600: '#5D4E37',
        },
        accent: {
          DEFAULT: '#ffa06f',
          dark: '#E58A5A',
        },
      },
      backgroundColor: {
        'cream': '#FBF8F3',
        'card': 'rgba(255, 255, 255, 0.95)',
      },
      textColor: {
        'primary': '#333333',
        'secondary': '#666666',
        'light': '#999999',
      },
      borderColor: {
        'cream': '#E0D5C8',
      },
      borderRadius: {
        'card': '1rem',
        'button': '2rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'button': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-warm': 'pulseWarm 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseWarm: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
