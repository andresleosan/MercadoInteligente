/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0f0f12',
        'bg-surface': '#1a1a23',
        'bg-elevated': '#23232e',
        'bg-header': '#08080c',
        'border-subtle': '#2a2a35',
        'text-primary': '#f1f1f6',
        'text-secondary': '#8b8b9e',
        'text-muted': '#5c5c6e',
        'accent-green': '#00a86b',
        'accent-amber': '#f5a623',
        'accent-red': '#e5484d',
      },
      borderRadius: {
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.3)',
        'elevated': '0 4px 20px rgba(0,0,0,0.4)',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto',
          'Oxygen', 'Ubuntu', 'Cantarell', '"Helvetica Neue"', 'Arial',
          'sans-serif',
        ],
      },
    },
  },
  safelist: [
    'animate-slide-down',
    'animate-slide-up',
    'animate-chevron',
  ],
  plugins: [],
}
