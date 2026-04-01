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
        title: 'V-Rhythm',
        icon: 'grid',
        items: [
          { value: 'true', title: 'Show grid', icon: 'eye' },
          { value: 'false', title: 'Hide grid', icon: 'eyeclose' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    vrhythm: 'true',
  },
});
