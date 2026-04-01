import { StyleObj, StyleProps } from './types';
import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
  DEFAULT_OPACITY,
  DEFAULT_Z_INDEX,
} from './constants';

export const getStyle = ({
  color = DEFAULT_COLOR,
  lineHeight = DEFAULT_LINE_HEIGHT,
  offset = DEFAULT_OFFSET,
  opacity = DEFAULT_OPACITY,
  zIndex = DEFAULT_Z_INDEX,
  columnWidth,
  columnColor,
}: StyleProps): StyleObj => {
  const horizontal = `linear-gradient(${color} 1px, transparent 1px) left top / 1px ${lineHeight}`;

  const background =
    columnWidth != null
      ? `${horizontal}, linear-gradient(90deg, ${columnColor ?? color} 1px, transparent 1px) left top / ${columnWidth} 1px`
      : horizontal;

  return {
    position: 'absolute',
    top: offset,
    left: 0,
    right: 0,
    bottom: 0,
    background,
    pointerEvents: 'none',
    opacity,
    zIndex,
  };
};
