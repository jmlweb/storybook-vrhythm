import './storybook-parameter-augmentation';

import type { DecoratorFunction, Renderer } from 'storybook/internal/types';
import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
  DEFAULT_OPACITY,
  DEFAULT_Z_INDEX,
  LINE_HEIGHT_DATA_KEY,
} from './constants';
import { getStyle, toCssLength } from './getStyle';
import { type PresetName, presets } from './presets';
import type { ConfigProps, StyleProps } from './types';
import { injectStyle, removeElement } from './utils';

export type VRhythmParams = StyleProps & ConfigProps;

const DEFAULT_PARAMS: VRhythmParams = {
  hide: false,
  preset: '',
  container: '',
  color: DEFAULT_COLOR,
  lineHeight: DEFAULT_LINE_HEIGHT,
  offset: DEFAULT_OFFSET,
  opacity: DEFAULT_OPACITY,
  zIndex: DEFAULT_Z_INDEX,
};

/**
 * Storybook decorator that injects a vertical rhythm baseline grid overlay into stories.
 *
 * Register globally via the addon preset in `.storybook/main.ts`:
 * ```ts
 * export default { addons: ['storybook-vrhythm'] };
 * ```
 *
 * Or manually in `.storybook/preview.ts`:
 * ```ts
 * import { withVRhythm } from 'storybook-vrhythm';
 * export const decorators = [withVRhythm];
 * ```
 *
 * Control per story via `parameters.vrhythm`:
 * ```ts
 * export const MyStory = {
 *   parameters: { vrhythm: { preset: 'material' } },
 * };
 * ```
 */
export const withVRhythm: DecoratorFunction<Renderer> = (storyFn, context) => {
  const raw = (context.parameters as { vrhythm?: VRhythmParams } | undefined)
    ?.vrhythm;
  const presetStyles =
    raw?.preset && raw.preset in presets
      ? presets[raw.preset as PresetName]
      : {};
  const params: VRhythmParams = {
    ...DEFAULT_PARAMS,
    ...presetStyles,
    ...raw,
  };

  const globalsVrhythm = (
    context.globals as { vrhythm?: string | boolean } | undefined
  )?.vrhythm;

  const globalPresetName =
    typeof globalsVrhythm === 'string' &&
    globalsVrhythm !== 'true' &&
    globalsVrhythm !== 'false' &&
    globalsVrhythm in presets
      ? (globalsVrhythm as PresetName)
      : null;

  const globalPresetStyles = globalPresetName ? presets[globalPresetName] : {};

  const isHidden =
    !!params.hide || globalsVrhythm === false || globalsVrhythm === 'false';

  if (isHidden) {
    removeElement();
  } else {
    const finalParams: VRhythmParams = { ...params, ...globalPresetStyles };
    const style = getStyle(finalParams);
    injectStyle(style, params.container || undefined, {
      [LINE_HEIGHT_DATA_KEY]: toCssLength(
        finalParams.lineHeight ?? DEFAULT_LINE_HEIGHT
      ),
    });
  }

  return storyFn(context);
};
