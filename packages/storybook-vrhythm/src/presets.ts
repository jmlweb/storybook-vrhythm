import type { StyleProps } from './types';

export const presets = {
  '4px': { lineHeight: '4px', color: 'rgba(0, 150, 255, 0.15)' },
  '8px': { lineHeight: '8px', color: 'rgba(0, 150, 255, 0.2)' },
  '16px': { lineHeight: '16px', color: 'rgba(204, 204, 204, 0.5)' },
  '24px': { lineHeight: '24px', color: 'rgba(204, 204, 204, 0.5)' },
  material: { lineHeight: '4px', color: 'rgba(244, 67, 54, 0.15)' },
  tailwind: { lineHeight: '4px', color: 'rgba(99, 102, 241, 0.15)' },
  bootstrap: { lineHeight: '8px', color: 'rgba(13, 110, 253, 0.2)' },
} as const satisfies Record<string, StyleProps>;

export type PresetName = keyof typeof presets;
