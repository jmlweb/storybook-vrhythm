import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { withVRhythm } from './index';

const preview: ProjectAnnotations<Renderer> = {
  decorators: [withVRhythm],
};

export default preview;
