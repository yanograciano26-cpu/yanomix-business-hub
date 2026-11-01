export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050816',
        electric: '#3B82F6',
        gold: '#F5C96F',
        violet: '#8B5CF6',
        panel: '#101827',
      },
      boxShadow: {
        glow: '0 0 30px rgba(59,130,246,0.35)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 35%), radial-gradient(circle at bottom right, rgba(139,92,246,0.2), transparent 30%)',
      },
    },
  },
  plugins: [],
};
