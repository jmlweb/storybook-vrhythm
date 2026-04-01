import { definePreviewAddon } from 'storybook/internal/csf';

import { withVRhythm, type VRhythmParams } from './index';

export default definePreviewAddon<{
  parameters: { vrhythm?: VRhythmParams };
  globals: { vrhythm?: string | boolean };
}>({
  decorators: [withVRhythm],
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
          { value: '16px', title: '16px baseline', icon: 'grid' },
          { value: '24px', title: '24px baseline', icon: 'grid' },
          { value: 'material', title: 'Material Design', icon: 'grid' },
          { value: 'tailwind', title: 'Tailwind CSS', icon: 'grid' },
          { value: 'bootstrap', title: 'Bootstrap', icon: 'grid' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    vrhythm: 'true',
  },
});
