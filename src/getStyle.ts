import { StyleObj, StyleProps } from './types';
import {
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
} from './constants';

const getStyle = ({
  color = DEFAULT_COLOR,
  lineHeight = DEFAULT_LINE_HEIGHT,
  offset = DEFAULT_OFFSET,
}: StyleProps): StyleObj => ({
  position: 'absolute',
  top: offset,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(${color} 1px, transparent 1px) left top / 1px ${lineHeight}`,
  pointerEvents: 'none',
});

export default getStyle;
