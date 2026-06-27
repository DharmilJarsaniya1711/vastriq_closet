import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import { tailwindColorsPalette } from './color';

const tailwind: Config = {
  important: true,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ...tailwindColorsPalette,
      },
      fontFamily: {
        inter: ['Inter', ...fontFamily.sans],
        sans: ['Inter', ...fontFamily.sans],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['Cinzel', '"Cormorant Garamond"', 'serif'],
      },
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '1rem' }],
      },
    },
  },
  plugins: [],
};

export default tailwind;
