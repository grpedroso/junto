/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // No red in the system, on purpose: no screen in this app should look
        // like an alarm. See the language rules in CONTRIBUTING.md.
        canvas: '#F7F9F8',
        surface: '#FFFFFF',
        line: '#E2E8E5',
        ink: '#16211E',
        'ink-soft': '#5C6E68',
        junto: '#1F6F5C',
        'junto-dark': '#175647',
        'junto-light': '#E3F0EC',
        calm: '#4A6FA5',
        'calm-light': '#E8EEF6',
        caution: '#8A6D1F',
      },
      fontSize: {
        question: ['22px', { lineHeight: '30px' }],
      },
    },
  },
  plugins: [],
};
