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
          { value: 'true', title: 'Show vertical rhythm', icon: 'eye' },
          { value: 'false', title: 'Hide vertical rhythm', icon: 'eyeclose' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    vrhythm: 'true',
  },
});
