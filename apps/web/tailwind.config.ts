import type { Config } from 'tailwindcss';
// eslint-disable-next-line import/no-extraneous-dependencies
import defaultTheme from 'tailwindcss/defaultTheme';

import { tailwind } from '@mejjos/theme';

const config: Config = {
  presets: [tailwind],
  important: true,
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
