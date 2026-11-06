import previewAddon from './preview';

export type { PresetAliasName, PresetName } from './presets';
export { presetAliases, presets } from './presets';
export type { ConfigProps, StyleProps } from './types';
export type { VRhythmParams } from './withVRhythm';
export { withVRhythm } from './withVRhythm';

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
