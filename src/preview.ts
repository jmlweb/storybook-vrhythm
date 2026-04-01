import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { withVRhythm } from './index';

const preview: ProjectAnnotations<Renderer> = {
  decorators: [withVRhythm],
  globalTypes: {
    vrhythm: {
      description: 'Toggle vertical rhythm grid overlay',
      toolbar: {
        title: 'V-Rhythm',
        icon: 'grid',
        items: [
          { value: true, title: 'Show grid', icon: 'eye' },
          { value: false, title: 'Hide grid', icon: 'eyeclose' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    vrhythm: true,
  },
};

export default preview;
