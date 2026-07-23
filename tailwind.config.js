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
        // Skeleton loading states — LYXO_UI_PROMPT.md Design Style
        skeleton: '#141414',
      },
      fontFamily: {
        // Inter (LYXO_UI_PROMPT.md Typography) — noms distincts des utilitaires
        // font-weight de Tailwind (medium/semibold/bold/black) pour éviter toute
        // collision de classe : chaque poids Inter est une font-family RN à part.
        sans: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        'inter-black': ['Inter_900Black'],
      },
      borderRadius: {
        // Soft rounded corners 12–16px — LYXO_UI_PROMPT.md Design Style
        card: '16px',
      },
      spacing: {
        // Tap targets ≥ 56px — LYXO_UI_PROMPT.md STRICT RULES #8
        tap: '56px',
      },
    },
  },
  plugins: [],
};
