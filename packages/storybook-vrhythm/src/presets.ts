import type { StyleProps } from './types';

const basePresets = {
  '4px': { lineHeight: '4px', color: 'rgba(0, 150, 255, 0.15)' },
  '8px': { lineHeight: '8px', color: 'rgba(0, 150, 255, 0.2)' },
  '12px': { lineHeight: '12px', color: 'rgba(0, 150, 255, 0.2)' },
  '16px': { lineHeight: '16px', color: 'rgba(204, 204, 204, 0.5)' },
  '24px': { lineHeight: '24px', color: 'rgba(204, 204, 204, 0.5)' },
  '32px': { lineHeight: '32px', color: 'rgba(204, 204, 204, 0.5)' },
} as const satisfies Record<string, StyleProps>;

type BasePresetName = keyof typeof basePresets;

/**
 * Design-system names that resolve to a base preset. An alias has no style of
 * its own: it is the base preset under a recognizable name.
 */
export const presetAliases = {
  material: '4px',
  tailwind: '4px',
  bootstrap: '24px',
  carbon: '8px',
} as const satisfies Record<string, BasePresetName>;

export type PresetAliasName = keyof typeof presetAliases;

const aliasStyles = Object.fromEntries(
  Object.entries(presetAliases).map(([alias, base]) => [
    alias,
    basePresets[base],
  ])
) as {
  [Alias in PresetAliasName]: (typeof basePresets)[(typeof presetAliases)[Alias]];
};

export const presets = { ...basePresets, ...aliasStyles };

export type PresetName = keyof typeof presets;
