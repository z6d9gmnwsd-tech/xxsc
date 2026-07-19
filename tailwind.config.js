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
        cream: '#F8F6F2',
        warm: { 50: '#FBF8F3', 100: '#F0DEBF', 200: '#E8D0A8', 300: '#D4B88A', 400: '#BFA06C' },
        accent: { DEFAULT: '#F6C12C', dark: '#D4A517', light: '#FDE68A' },
        primary: '#333333',
        secondary: '#666666',
        tertiary: '#999999',
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '20px' },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'slide-down': 'slideDown 0.3s ease',
      },
    },
  },
  plugins: [],
}
