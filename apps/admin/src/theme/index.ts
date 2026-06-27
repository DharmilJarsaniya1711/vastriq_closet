import { createTheme, rem } from '@mantine/core';

import { mantine } from '@mejjos/theme';

const theme = createTheme({
  ...mantine,
  fontFamily: 'Inter, system-ui, sans-serif',
  primaryColor: 'primary',
  primaryShade: 9,
  defaultRadius: 'md',
  headings: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: '500',
    sizes: {
      h1: {
        fontSize: rem(40),
        fontWeight: '500',
        lineHeight: '120%',
      },
      h2: {
        fontSize: rem(32),
        fontWeight: '500',
        lineHeight: '120%',
      },
      h3: {
        fontSize: rem(24),
        fontWeight: '500',
        lineHeight: '120%',
      },
      h4: {
        fontSize: rem(20),
        fontWeight: '500',
        lineHeight: '120%',
      },
      h5: {
        fontSize: rem(16),
        fontWeight: '500',
        lineHeight: '120%',
      },
      h6: {
        fontSize: rem(14),
        fontWeight: '500',
        lineHeight: '120%',
      },
    },
  },
  components: {},
});

export default theme;
