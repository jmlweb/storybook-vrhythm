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
