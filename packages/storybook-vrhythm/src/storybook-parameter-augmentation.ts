import type { ConfigProps, StyleProps } from './types';

declare module 'storybook/internal/types' {
  interface StorybookParameters {
    /** Vertical rhythm overlay options (storybook-vrhythm). */
    vrhythm?: StyleProps & ConfigProps;
  }
}

declare module 'storybook/internal/csf' {
  interface Globals {
    /** Toolbar toggle for the vertical rhythm overlay (`'true'` | `'false'` or boolean). */
    vrhythm?: string | boolean;
  }
}

export {};
