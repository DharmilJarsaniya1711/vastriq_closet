import type { MantineColorsTuple } from '@mantine/core';

import type { ExtendedCustomColors } from '@mejjos/theme';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
