import { createTheme } from '@mantine/core';

import { mantine } from '@mejjos/theme';

import ExtendedButton from '../components/shared/Button/Button';
import ExtendedTextInput from '../components/shared/TextInput/TextInput';

const theme = createTheme({
  ...mantine,
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: '500',
  },
  primaryColor: 'primary',
  primaryShade: 9,
  defaultRadius: 'md',
  components: {
    Button: ExtendedButton,
    TextInput: ExtendedTextInput,
  },
});

export default theme;
