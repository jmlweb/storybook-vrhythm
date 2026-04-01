import type { Meta, StoryObj } from "@storybook/vue3";
import "storybook-vrhythm";
import { defineComponent } from "vue";

const RhythmBox = defineComponent({
  template: `<div style="padding: 32px; font-size: 16px; line-height: 24px;">
    Check the vertical rhythm overlay behind this box.
  </div>`,
});

const meta: Meta<typeof RhythmBox> = {
  title: "VRhythm/Integration",
  component: RhythmBox,
};
export { meta as default };

export const Default: StoryObj<typeof RhythmBox> = {};

export const WithPreset: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { preset: "tailwind" } },
};

export const Hidden: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { hide: true } },
};

export const PresetMaterial: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { preset: "material" } },
};

export const PresetBootstrap: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { preset: "bootstrap" } },
};

export const CustomLineHeight: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { lineHeight: "12px" } },
};

export const CustomColor: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { color: "rgba(255, 0, 0, 0.3)" } },
};

export const CustomOffset: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { offset: "8px" } },
};

export const CustomOpacity: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { opacity: 0.8 } },
};

export const PresetWithOverrides: StoryObj<typeof RhythmBox> = {
  parameters: {
    vrhythm: { preset: "material", lineHeight: "8px", opacity: 0.5 },
  },
};

export const FullCustom: StoryObj<typeof RhythmBox> = {
  parameters: {
    vrhythm: {
      lineHeight: "20px",
      color: "rgba(0, 200, 100, 0.25)",
      offset: "4px",
      opacity: 0.6,
    },
  },
};
