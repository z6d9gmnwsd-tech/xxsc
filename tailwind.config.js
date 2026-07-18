/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'PingFang SC', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FAF0E4',
          100: '#F5E6D0',
          200: '#E0C9A8',
          300: '#C4A882',
          400: '#A68B6B',
          500: '#8B6914',
          600: '#5D4E37',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
