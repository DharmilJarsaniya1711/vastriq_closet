import { mantineColorsPalette, MantineColorsPaletteKeys } from './color';
import type { MantineThemeOverride } from '@mantine/core';

import { DefaultMantineColor, MantineColorsTuple, createTheme } from '@mantine/core';

export type ExtendedCustomColors = MantineColorsPaletteKeys | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}

const mantine: MantineThemeOverride = createTheme({
  colors: mantineColorsPalette,
  primaryColor: 'primary',
});

export default mantine;
