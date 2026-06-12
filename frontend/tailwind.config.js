/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        platinum: { DEFAULT: '#1e3a5f', light: '#e8f0f9' },
        gold: { DEFAULT: '#d97706', light: '#fef3c7' },
        silver: { DEFAULT: '#6b7280', light: '#f3f4f6' },
        bronze: { DEFAULT: '#c2410c', light: '#fff7ed' },
        experimental: { DEFAULT: '#7c3aed', light: '#f5f3ff' }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};
