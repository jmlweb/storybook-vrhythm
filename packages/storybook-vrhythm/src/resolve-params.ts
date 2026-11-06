import {
  ANCHOR_PAGE,
  ANCHOR_STORY,
  DEFAULT_COLOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_OFFSET,
  DEFAULT_OPACITY,
  DEFAULT_Z_INDEX,
} from './constants';
import { type PresetName, presets } from './presets';
import type { VRhythmParams } from './types';

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

const isPresetName = (name: string): name is PresetName => name in presets;

export interface VRhythmContext {
  parameters?: { vrhythm?: VRhythmParams };
  globals?: { vrhythm?: string | boolean };
  viewMode?: string;
}

export interface ResolvedParams {
  params: VRhythmParams;
  isHidden: boolean;
  anchor: string;
  /** The `preset` value when it names no preset, otherwise `undefined`. */
  unknownPreset?: string;
}

/** Parameter resolution order: defaults, story preset, story params, toolbar preset. */
export const resolveParams = ({
  parameters,
  globals,
  viewMode,
}: VRhythmContext): ResolvedParams => {
  const raw = parameters?.vrhythm;
  const toolbar = globals?.vrhythm;

  const hasPreset = !!raw?.preset;
  const isKnownPreset = hasPreset && isPresetName(raw.preset as string);
  const toolbarPreset =
    typeof toolbar === 'string' && isPresetName(toolbar)
      ? presets[toolbar]
      : {};

  const merged: VRhythmParams = {
    ...DEFAULT_PARAMS,
    ...(isKnownPreset ? presets[raw.preset as PresetName] : {}),
    ...raw,
  };

  return {
    params: { ...merged, ...toolbarPreset },
    isHidden: !!merged.hide || toolbar === false || toolbar === 'false',
    // One overlay cannot follow several stories on a Docs page.
    anchor:
      viewMode === 'docs'
        ? ANCHOR_PAGE
        : merged.anchor || merged.container || ANCHOR_STORY,
    unknownPreset: hasPreset && !isKnownPreset ? raw.preset : undefined,
  };
};
