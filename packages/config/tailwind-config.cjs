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
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          light: '#DCFCE7',
          navy: '#1E293B',
        },
      },
      borderRadius: {
        md: '8px',
      },
    },
  },
  plugins: [],
}
