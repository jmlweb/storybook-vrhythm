import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_LINE_WIDTH,
  DEFAULT_OFFSET,
  DEFAULT_OPACITY,
  DEFAULT_Z_INDEX,
} from './constants';
import type { StyleObj, StyleProps } from './types';

// A unitless 0 is a valid length, but invalid inside the overlay's `calc()`.
export const toCssLength = (value: string | number): string =>
  typeof value === 'number' || value.trim() === '0' ? `${value}px` : value;

export const getStyle = ({
  color = DEFAULT_COLOR,
  lineHeight = DEFAULT_LINE_HEIGHT,
  lineWidth = DEFAULT_LINE_WIDTH,
  offset = DEFAULT_OFFSET,
  opacity = DEFAULT_OPACITY,
  zIndex = DEFAULT_Z_INDEX,
  maxWidth,
  columnWidth,
  columnColor,
  gutterWidth,
}: StyleProps): StyleObj => {
  const line = toCssLength(lineWidth);
  const horizontal = `linear-gradient(${color} ${line}, transparent ${line}) left top / ${line} ${toCssLength(lineHeight)}`;

  const column = columnWidth != null ? toCssLength(columnWidth) : null;
  const gutter = gutterWidth != null ? toCssLength(gutterWidth) : null;
  const columnGradient =
    column != null
      ? gutter != null
        ? `linear-gradient(90deg, transparent calc(${column} - ${gutter}), ${columnColor ?? color} calc(${column} - ${gutter})) left top / ${column} 100%`
        : `linear-gradient(90deg, ${columnColor ?? color} ${line}, transparent ${line}) left top / ${column} 100%`
      : null;

  const background =
    columnGradient != null ? `${horizontal}, ${columnGradient}` : horizontal;

  const positioning: StyleObj =
    maxWidth != null
      ? {
          left: '50%',
          width: toCssLength(maxWidth),
          transform: 'translateX(-50%)',
        }
      : { left: 0, right: 0 };

  return {
    position: 'absolute',
    top: toCssLength(offset),
    ...positioning,
    bottom: 0,
    background,
    pointerEvents: 'none',
    opacity,
    zIndex,
  };
};
