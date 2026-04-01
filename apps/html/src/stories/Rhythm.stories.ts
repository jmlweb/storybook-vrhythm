import type { Meta, StoryObj } from "@storybook/html";
import "storybook-vrhythm";

const meta: Meta = {
  title: "VRhythm/Integration",
  render: () => {
    const el = document.createElement("div");
    el.style.cssText = "padding: 32px; font-size: 16px; line-height: 24px;";
    el.textContent = "Check the vertical rhythm overlay behind this box.";
    return el;
  },
};
export { meta as default };

export const Default: StoryObj = {};

export const WithPreset: StoryObj = {
  parameters: { vrhythm: { preset: "tailwind" } },
};

export const Hidden: StoryObj = {
  parameters: { vrhythm: { hide: true } },
};

export const PresetMaterial: StoryObj = {
  parameters: { vrhythm: { preset: "material" } },
};

export const PresetBootstrap: StoryObj = {
  parameters: { vrhythm: { preset: "bootstrap" } },
};

export const CustomLineHeight: StoryObj = {
  parameters: { vrhythm: { lineHeight: "12px" } },
};

export const CustomColor: StoryObj = {
  parameters: { vrhythm: { color: "rgba(255, 0, 0, 0.3)" } },
};

export const CustomOffset: StoryObj = {
  parameters: { vrhythm: { offset: "8px" } },
};

export const CustomOpacity: StoryObj = {
  parameters: { vrhythm: { opacity: 0.8 } },
};

export const PresetWithOverrides: StoryObj = {
  parameters: {
    vrhythm: { preset: "material", lineHeight: "8px", opacity: 0.5 },
  },
};

export const FullCustom: StoryObj = {
  parameters: {
    vrhythm: {
      lineHeight: "20px",
      color: "rgba(0, 200, 100, 0.25)",
      offset: "4px",
      opacity: 0.6,
    },
  },
};
