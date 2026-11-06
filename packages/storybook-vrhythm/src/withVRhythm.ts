import './storybook-parameter-augmentation';

import type { DecoratorFunction, Renderer } from 'storybook/internal/types';
import {
  ANCHOR_DATA_KEY,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
  LINE_HEIGHT_DATA_KEY,
  OFFSET_DATA_KEY,
  UNKNOWN_PRESET_DATA_KEY,
} from './constants';
import { getStyle, toCssLength } from './getStyle';
import { resolveParams, type VRhythmContext } from './resolve-params';
import { injectStyle, keepOverlayInSync, removeElement } from './utils';

export type { VRhythmParams } from './types';

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
 * export default { decorators: [withVRhythm] };
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
  const { params, isHidden, anchor, unknownPreset } = resolveParams(
    context as VRhythmContext
  );

  if (unknownPreset) {
    console.warn(
      `storybook-vrhythm: unknown preset "${unknownPreset}", using lineHeight ${toCssLength(params.lineHeight ?? DEFAULT_LINE_HEIGHT)}.`
    );
  }

  if (isHidden) {
    removeElement();
  } else {
    injectStyle(getStyle(params), {
      [LINE_HEIGHT_DATA_KEY]: toCssLength(
        params.lineHeight ?? DEFAULT_LINE_HEIGHT
      ),
      [OFFSET_DATA_KEY]: toCssLength(params.offset ?? DEFAULT_OFFSET),
      [ANCHOR_DATA_KEY]: anchor,
      ...(unknownPreset ? { [UNKNOWN_PRESET_DATA_KEY]: unknownPreset } : {}),
    });
    keepOverlayInSync(context.canvasElement as Element | undefined);
  }

  return storyFn(context);
};
