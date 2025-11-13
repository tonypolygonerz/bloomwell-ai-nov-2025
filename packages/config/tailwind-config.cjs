/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    '../../apps/web/app/**/*.{ts,tsx}',
    '../../apps/web/components/**/*.{ts,tsx}',
    '../../apps/admin/app/**/*.{ts,tsx}',
    '../../apps/admin/components/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00A150',
          hover: '#16A34A',
          light: '#DCFCE7',
          navy: '#1E293B',
        },
      },
      borderRadius: {
        md: '8px',
        card: '1rem',
        button: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 161, 80, 0.15)',
      },
    },
  },
  plugins: [],
}
