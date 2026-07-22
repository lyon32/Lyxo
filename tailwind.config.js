/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Palette Braise — LYXO_UI_PROMPT.md / CLAUDE_LYXO_V3.md §19.11
        bg: '#0B0A0A',
        card: '#151312',
        input: '#1E1B1A',
        border: '#2C2826',
        muted: '#8E8781',
        fg: '#F5F1EC',
        ember: '#C73E3A',
        steel: '#3A3F47',
      },
    },
  },
  plugins: [],
};
