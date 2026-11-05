import type { Meta, StoryObj } from "@storybook/react";
import { auditRhythm, expectRhythm } from "storybook-vrhythm/audit";
import { expect } from "storybook/test";

const Block = ({ top, height }: { top: number; height: number }) => (
  <div style={{ marginTop: top, height, background: "#eee" }} data-testid="block" />
);

const meta: Meta<typeof Block> = {
  title: "VRhythm/Audit",
  component: Block,
  parameters: { layout: "fullscreen", vrhythm: { preset: "8px" } },
};
export default meta;

export const OnGrid: StoryObj<typeof Block> = {
  args: { top: 16, height: 24 },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
};

export const OffGrid: StoryObj<typeof Block> = {
  args: { top: 21, height: 19 },
  play: async ({ canvasElement }) => {
    const { violations } = await auditRhythm(canvasElement);

    await expect(violations).toEqual([
      {
        selector: '[data-testid="block"]',
        edge: "top",
        actual: 21,
        nearest: 24,
        delta: -3,
      },
    ]);
    await expect(expectRhythm(canvasElement)).rejects.toThrow("delta -3px");
  },
};

export const GridFromPreset: StoryObj<typeof Block> = {
  args: { top: 12, height: 24 },
  parameters: { vrhythm: { preset: "4px" } },
  play: async ({ canvasElement }) => {
    const { grid, ok } = await auditRhythm(canvasElement);

    await expect(grid.lineHeight).toBe(4);
    await expect(ok).toBe(true);
  },
};

export const GridWithOffset: StoryObj<typeof Block> = {
  args: { top: 12, height: 8 },
  parameters: { vrhythm: { lineHeight: "8px", offset: "4px" } },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
};

export const HiddenOverlayNeedsOptions: StoryObj<typeof Block> = {
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { hide: true } },
  play: async ({ canvasElement }) => {
    await expect(expectRhythm(canvasElement)).rejects.toThrow("No grid found");

    const { grid, ok } = await auditRhythm(canvasElement, { lineHeight: "8px" });

    await expect(grid.origin).toBe(canvasElement.getBoundingClientRect().top);
    await expect(ok).toBe(true);
  },
};

const FONT_SIZES = [12, 16, 24, 40];

export const BaselineMatchesBrowser: StoryObj<typeof Block> = {
  render: () => (
    <>
      {FONT_SIZES.map((fontSize) => (
        <p key={fontSize} style={{ fontSize, margin: 0 }}>
          Baseline
          <span data-probe style={{ display: "inline-block" }} />
        </p>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    // An empty inline-block sits on the baseline, so it gives the browser's own answer.
    const expected = Array.from(
      canvasElement.querySelectorAll("[data-probe]"),
    ).map((probe) => probe.getBoundingClientRect().bottom);

    const { grid, violations } = await auditRhythm(canvasElement, {
      lineHeight: 100000,
      tolerance: 0,
      checks: ["baseline"],
    });

    await expect(violations).toHaveLength(FONT_SIZES.length);
    violations.forEach(({ actual }, index) => {
      expect(Math.abs(actual + grid.origin - expected[index])).toBeLessThanOrEqual(1);
    });
  },
};
