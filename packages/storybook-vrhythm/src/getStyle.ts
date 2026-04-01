import { StyleObj, StyleProps } from './types';
import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_LINE_WIDTH,
  DEFAULT_OFFSET,
  DEFAULT_OPACITY,
  DEFAULT_Z_INDEX,
} from './constants';

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
  const horizontal = `linear-gradient(${color} ${lineWidth}, transparent ${lineWidth}) left top / ${lineWidth} ${lineHeight}`;

  const columnGradient =
    columnWidth != null
      ? gutterWidth != null
        ? `linear-gradient(90deg, transparent calc(${columnWidth} - ${gutterWidth}), ${columnColor ?? color} calc(${columnWidth} - ${gutterWidth})) left top / ${columnWidth} 100%`
        : `linear-gradient(90deg, ${columnColor ?? color} ${lineWidth}, transparent ${lineWidth}) left top / ${columnWidth} 100%`
      : null;

  const background =
    columnGradient != null ? `${horizontal}, ${columnGradient}` : horizontal;

  const positioning: StyleObj =
    maxWidth != null
      ? { left: '50%', width: maxWidth, transform: 'translateX(-50%)' }
      : { left: 0, right: 0 };

  return {
    position: 'absolute',
    top: offset,
    ...positioning,
    bottom: 0,
    background,
    pointerEvents: 'none',
    opacity,
    zIndex,
  };
};
