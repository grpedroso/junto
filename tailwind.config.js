/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Sem vermelho no sistema, de proposito: nenhuma tela deste app deve
        // parecer alarme. Ver CONTRIBUTING.md, regras de linguagem.
        fundo: '#F7F9F8',
        superficie: '#FFFFFF',
        borda: '#E2E8E5',
        tinta: '#16211E',
        'tinta-suave': '#5C6E68',
        junto: '#1F6F5C',
        'junto-escuro': '#175647',
        'junto-claro': '#E3F0EC',
        calma: '#4A6FA5',
        'calma-clara': '#E8EEF6',
        atencao: '#8A6D1F',
      },
      fontSize: {
        pergunta: ['22px', { lineHeight: '30px' }],
      },
    },
  },
  plugins: [],
};
