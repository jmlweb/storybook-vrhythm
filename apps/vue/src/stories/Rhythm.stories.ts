import { defineComponent } from 'vue';
import preview from '../../.storybook/preview';

const RhythmBox = defineComponent({
  template: `<div style="padding: 32px; font-size: 16px; line-height: 24px;">
    Check the vertical rhythm overlay behind this box.
  </div>`,
});

const meta = preview.meta({
  title: 'VRhythm/Integration',
  component: RhythmBox,
});

export const Default = meta.story();

export const WithPreset = meta.story({
  parameters: { vrhythm: { preset: 'tailwind' } },
});

export const Hidden = meta.story({
  parameters: { vrhythm: { hide: true } },
});

export const PresetMaterial = meta.story({
  parameters: { vrhythm: { preset: 'material' } },
});

export const PresetBootstrap = meta.story({
  parameters: { vrhythm: { preset: 'bootstrap' } },
});

export const PresetCarbon = meta.story({
  parameters: { vrhythm: { preset: 'carbon' } },
});

export const Preset12px = meta.story({
  parameters: { vrhythm: { preset: '12px' } },
});

export const Preset32px = meta.story({
  parameters: { vrhythm: { preset: '32px' } },
});

export const CustomLineHeight = meta.story({
  parameters: { vrhythm: { lineHeight: '12px' } },
});

export const CustomColor = meta.story({
  parameters: { vrhythm: { color: 'rgba(255, 0, 0, 0.3)' } },
});

export const CustomOffset = meta.story({
  parameters: { vrhythm: { offset: '8px' } },
});

export const CustomOpacity = meta.story({
  parameters: { vrhythm: { opacity: 0.8 } },
});

export const PresetWithOverrides = meta.story({
  parameters: {
    vrhythm: { preset: 'material', lineHeight: '8px', opacity: 0.5 },
  },
});

export const FullCustom = meta.story({
  parameters: {
    vrhythm: {
      lineHeight: '20px',
      color: 'rgba(0, 200, 100, 0.25)',
      offset: '4px',
      opacity: 0.6,
    },
  },
});
