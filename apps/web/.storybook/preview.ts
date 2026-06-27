import { themes } from '@storybook/theming';
import type { Preview } from '@storybook/react';

import '../src/styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dropzone/styles.css';

import { decorators } from './mantine';

const preview: Preview = {
  decorators: decorators,
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      // Override the default dark theme
      dark: {
        ...themes.dark,
        appBg: '#000',
      },
      // Override the default light theme
      light: {
        ...themes.normal,
        defaultText: '#000',
        textMutedColor: '#000',
        appBg: '#fffce1',
      },
    },
  },
};

export default preview;
