import type { ConfigProps, StyleProps } from './types';

declare module 'storybook/internal/types' {
  interface StorybookParameters {
    /** Vertical rhythm overlay options (storybook-vrhythm). */
    vrhythm?: StyleProps & ConfigProps;
  }
}

declare module 'storybook/internal/csf' {
  interface Globals {
    /** Toolbar toggle/preset selector for the vertical rhythm overlay.
     * Values: `'true'` (show with story params) | `'false'` (hide) | preset name (e.g. `'material'`, `'tailwind'`) | boolean. */
    vrhythm?: string | boolean;
  }
}

export {};
