/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        shield: {
          blue: '#2563eb',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          dark: '#0B1120',
          darker: '#060913',
          card: '#111827',
          border: '#1f2937',
        },
        burgundy: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          200: '#f7d0d6',
          300: '#f1abb6',
          400: '#e57a8c',
          500: '#d44d64',
          600: '#b8324b',
          700: '#9b243b',
          800: '#822034',
          900: '#6f1e2f',
          950: '#3e0a15',
        },
        maroon: {
          50: '#fdf2f2',
          100: '#fbe3e3',
          200: '#f7cbcb',
          300: '#f0a6a6',
          400: '#e47474',
          500: '#d24848',
          600: '#bb3333',
          700: '#9c2727',
          800: '#822424',
          900: '#541515',
          950: '#2c0808',
        },
        cream: {
          50: '#fffdf8',
          100: '#fffbf2',
          200: '#fff8e7', // Cosmic Latte
          300: '#faedd0',
          400: '#f5e3ba',
          500: '#ebd19a',
          600: '#d4b377',
          700: '#b08f57',
          800: '#8c7042',
          900: '#6e5633',
          950: '#3d2e18',
        },
        cosmic: {
          DEFAULT: '#fff8e7',
          light: '#fffbf2',
          dark: '#faedd0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(37, 99, 235, 0.25)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
