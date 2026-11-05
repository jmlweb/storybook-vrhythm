import previewAddon from './preview';

export { withVRhythm } from './withVRhythm';
export type { VRhythmParams } from './withVRhythm';
export { presets } from './presets';
export type { PresetName } from './presets';
export type { StyleProps, ConfigProps } from './types';

/**
 * CSF Next entry point. Register it in `.storybook/preview.ts`:
 * ```ts
 * import { definePreview } from '@storybook/your-framework';
 * import vrhythm from 'storybook-vrhythm';
 *
 * export default definePreview({ addons: [vrhythm()] });
 * ```
 */
export default () => previewAddon;
