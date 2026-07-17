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
        primary: {
          50: '#FAF0E4',
          100: '#F5E6D0',
          200: '#E0C9A8',
          300: '#C4A882',
          400: '#A68B6B',
          500: '#8B6914',
          600: '#5D4E37',
        },
        cream: {
          50: '#FBF8F3',
          100: '#F5E6D0',
          200: '#E0C9A8',
          300: '#C4A882',
        },
        amber: {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#F6C12C',
          300: '#E5B020',
        }
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
        'card': '28rpx',
        'button': '50rpx',
      },
      boxShadow: {
        'card': '0 4rpx 24rpx rgba(0, 0, 0, 0.06), 0 1rpx 6rpx rgba(0, 0, 0, 0.03)',
        'button': '0 4rpx 16rpx rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
