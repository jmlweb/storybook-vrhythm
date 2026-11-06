import { definePreviewAddon } from 'storybook/internal/csf';

import { runAutoAudit } from './auto-audit';
import type { VRhythmParams } from './types';
import { withVRhythm } from './withVRhythm';

export default definePreviewAddon<{
  parameters: { vrhythm?: VRhythmParams };
  globals: { vrhythm?: string | boolean };
}>({
  decorators: [withVRhythm],
  afterEach: runAutoAudit,
  globalTypes: {
    vrhythm: {
      description: 'Toggle vertical rhythm grid overlay',
      toolbar: {
        title: 'Show vertical rhythm',
        icon: 'grid',
        items: [
          { value: 'true', title: 'Default (story params)', icon: 'eye' },
          { value: 'false', title: 'Hide', icon: 'eyeclose' },
          { value: '4px', title: '4px baseline', icon: 'grid' },
          { value: '8px', title: '8px baseline', icon: 'grid' },
          { value: '12px', title: '12px baseline', icon: 'grid' },
          { value: '16px', title: '16px baseline', icon: 'grid' },
          { value: '24px', title: '24px baseline', icon: 'grid' },
          { value: '32px', title: '32px baseline', icon: 'grid' },
          {
            value: 'material',
            title: 'Material Design (alias of 4px)',
            icon: 'grid',
          },
          {
            value: 'tailwind',
            title: 'Tailwind CSS (alias of 4px)',
            icon: 'grid',
          },
          {
            value: 'bootstrap',
            title: 'Bootstrap (alias of 24px)',
            icon: 'grid',
          },
          { value: 'carbon', title: 'Carbon (alias of 8px)', icon: 'grid' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    vrhythm: 'true',
  },
});
