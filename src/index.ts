import type { DecoratorFunction } from '@storybook/types';

import { getStyle } from './getStyle';
import { StyleProps, ConfigProps } from './types';
import { injectStyle, removeElement } from './utils';
import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
} from './constants';

export type VRhythmParams = StyleProps & ConfigProps;

const DEFAULT_PARAMS: Required<VRhythmParams> = {
  hide: false,
  color: DEFAULT_COLOR,
  lineHeight: DEFAULT_LINE_HEIGHT,
  offset: DEFAULT_OFFSET,
};

export const withVRhythm: DecoratorFunction = (storyFn, context) => {
  const params: Required<VRhythmParams> = {
    ...DEFAULT_PARAMS,
    ...(context.parameters as { vrhythm?: VRhythmParams } | undefined)?.vrhythm,
  };

  if (params.hide) {
    removeElement();
  } else {
    const style = getStyle(params);
    injectStyle(style);
  }

  return storyFn(context);
};

export type { StyleProps, ConfigProps } from './types';
