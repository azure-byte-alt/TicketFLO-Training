import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a2744',
          50: '#f0f3fa',
          100: '#d9e0f0',
          200: '#b3c1e1',
          300: '#8da2d2',
          400: '#6783c3',
          500: '#4164b4',
          600: '#344f90',
          700: '#273b6c',
          800: '#1a2744',
          900: '#0d1422',
        },
        teal: {
          DEFAULT: '#4db8a4',
          50: '#f0fbf8',
          100: '#ccf2ea',
          200: '#99e5d5',
          300: '#66d8c0',
          400: '#4db8a4',
          500: '#33a08d',
          600: '#268071',
          700: '#1a6055',
          800: '#0d4038',
          900: '#07201c',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
