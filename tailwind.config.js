/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: {
          black: '#000000',
          dark: '#050505',
          surface: '#0a0a0a',
          border: '#1a1a1a',
          muted: '#2a2a2a',
          text: '#c8c8c8',
          dim: '#666666',
          accent: '#8b5cf6',
          'accent-dim': '#4c1d95',
          glow: '#a78bfa',
          red: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        glitch: 'glitch 2s infinite',
        'glitch-1': 'glitch-1 3s infinite linear alternate-reverse',
        'glitch-2': 'glitch-2 3s infinite linear alternate-reverse',
        flicker: 'flicker 4s infinite',
        pulse_slow: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scanline: 'scanline 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(-2px, -2px)', filter: 'hue-rotate(-90deg)' },
          '60%': { transform: 'translate(2px, 2px)', filter: 'hue-rotate(0deg)' },
          '80%': { transform: 'translate(2px, -2px)', filter: 'hue-rotate(180deg)' },
        },
        'glitch-1': {
          '0%': { clipPath: 'inset(40% 0 61% 0)', transform: 'translate(-20px, 0)' },
          '20%': { clipPath: 'inset(92% 0 1% 0)', transform: 'translate(20px, 0)' },
          '40%': { clipPath: 'inset(43% 0 1% 0)', transform: 'translate(-10px, 0)' },
          '60%': { clipPath: 'inset(25% 0 58% 0)', transform: 'translate(10px, 0)' },
          '80%': { clipPath: 'inset(54% 0 7% 0)', transform: 'translate(-20px, 0)' },
          '100%': { clipPath: 'inset(58% 0 43% 0)', transform: 'translate(20px, 0)' },
        },
        'glitch-2': {
          '0%': { clipPath: 'inset(25% 0 58% 0)', transform: 'translate(20px, 0)' },
          '20%': { clipPath: 'inset(54% 0 7% 0)', transform: 'translate(-20px, 0)' },
          '40%': { clipPath: 'inset(58% 0 43% 0)', transform: 'translate(10px, 0)' },
          '60%': { clipPath: 'inset(40% 0 61% 0)', transform: 'translate(-10px, 0)' },
          '80%': { clipPath: 'inset(92% 0 1% 0)', transform: 'translate(20px, 0)' },
          '100%': { clipPath: 'inset(43% 0 1% 0)', transform: 'translate(-20px, 0)' },
        },
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};
