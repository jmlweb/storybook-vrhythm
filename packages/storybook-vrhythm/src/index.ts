import './storybook-parameter-augmentation';

import type { DecoratorFunction, Renderer } from 'storybook/internal/types';

import { getStyle } from './getStyle';
import { StyleProps, ConfigProps } from './types';
import { presets, PresetName } from './presets';
import { injectStyle, removeElement } from './utils';
import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
  DEFAULT_OPACITY,
  DEFAULT_Z_INDEX,
} from './constants';

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
    injectStyle(style, params.container || undefined);
  }

  return storyFn(context);
};

export { presets } from './presets';
export type { PresetName } from './presets';
export type { StyleProps, ConfigProps } from './types';
