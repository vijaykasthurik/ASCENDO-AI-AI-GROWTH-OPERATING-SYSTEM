/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F4F0',
        espresso: '#1E0D08',
        espresso2: '#2B120B',
        card: '#FFFFFF',
        primary: '#F2622E',
        primaryDeep: '#C2410C',
        amber: '#F5A623',
        peach: '#FCD9B8',
        mint: '#4DD4AC',
        textDark: '#1A1210',
        textMuted: '#806F67',
        success: '#22C55E',
        warn: '#F59E0B',
        danger: '#EF4444',
        darkBg: '#0E1420',
        surface: '#16202E',
        cardDark: '#1B2736',
        teal: '#2DD4BF',
        tealDeep: '#0F9C8C',
        line: '#24313F',
        textLight: '#E8EEF4',
        muted: '#8A9BA8',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 18px 50px rgba(43,15,10,.08)',
        glow: '0 12px 40px rgba(242,98,46,.3)',
      },
    },
  },
  plugins: [],
}
