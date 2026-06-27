/** @type {import('tailwindcss').Config} */
import { tailwind } from '@mejjos/theme';

export default {
  presets: [tailwind],

  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
