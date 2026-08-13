/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        imperial: {
          black: '#0A0A0A',
          obsidian: '#121214',
          carbon: '#1A1A1F',
          slate: '#242429',
          ash: '#2E2E35',
          muted: '#6B6B76',
          cream: '#F5F0E8',
          parchment: '#FAF6EE',
          bone: '#EDE8DA',
          gold: '#C9A84C',
          'gold-light': '#D4B96A',
          'gold-dark': '#A8893D',
          bronze: '#B08D57',
          brass: '#8B7340',
          wine: '#6B2D3E',
          'wine-light': '#8A3D52',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'imperial': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
        'imperial-lg': '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'gold-glow': '0 0 20px rgba(201, 168, 76, 0.15)',
        'gold-glow-lg': '0 0 40px rgba(201, 168, 76, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #D4B96A 50%, #A8893D 100%)',
        'dark-gradient': 'linear-gradient(180deg, #121214 0%, #0A0A0A 100%)',
        'parchment-gradient': 'linear-gradient(180deg, #FAF6EE 0%, #F5F0E8 50%, #EDE8DA 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
      },
      borderColor: {
        'imperial': 'rgba(201, 168, 76, 0.15)',
        'imperial-strong': 'rgba(201, 168, 76, 0.35)',
        'glass': 'rgba(255, 255, 255, 0.06)',
        'glass-strong': 'rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 168, 76, 0)' },
          '50%': { boxShadow: '0 0 12px 2px rgba(201, 168, 76, 0.15)' },
        },
      },
    },
  },
  plugins: [],
}
