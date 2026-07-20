/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':       '#0B1120',
        'bg-surface':    '#111827',
        'bg-elevated':   '#1F2937',
        'bg-input':      '#1F2937',
        'bg-header':     '#0B1120',
        'border-subtle': 'rgba(255,255,255,0.08)',
        'text-primary':  '#F9FAFB',
        'text-secondary':'#9CA3AF',
        'text-muted':    '#6B7280',
        'accent-green':  '#10B981',
        'accent-success':'#22C55E',
        'accent-amber':  '#F59E0B',
        'accent-red':    '#EF4444',
      },
      boxShadow: {
        'card':     '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.3)',
        'elevated': '0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.3)',
        'glow':     '0 0 20px rgba(16,185,129,0.15)',
      },
      borderRadius: {
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '20px',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      animation: {
        'slide-down': 'slide-down 300ms ease-out',
        'slide-up':   'slide-up 200ms ease-in',
        'chevron':    'chevron 300ms ease',
      },
      keyframes: {
        'slide-down': {
          '0%':   { opacity: '0', maxHeight: '0' },
          '100%': { opacity: '1', maxHeight: '1000px' },
        },
        'slide-up': {
          '0%':   { opacity: '1', maxHeight: '1000px' },
          '100%': { opacity: '0', maxHeight: '0' },
        },
        'chevron': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'animate-slide-down',
    'animate-slide-up',
    'animate-chevron',
  ],
}
