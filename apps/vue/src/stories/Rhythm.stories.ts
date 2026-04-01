import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';

const RhythmBox = defineComponent({
  template: `<div style="padding: 32px; font-size: 16px; line-height: 24px;">
    Check the vertical rhythm overlay behind this box.
  </div>`,
});

const meta: Meta<typeof RhythmBox> = {
  title: 'VRhythm/Integration',
  component: RhythmBox,
};
export { meta as default };

export const Default: StoryObj<typeof RhythmBox> = {};

export const WithPreset: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { preset: 'tailwind' } },
};

export const Hidden: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { hide: true } },
};
