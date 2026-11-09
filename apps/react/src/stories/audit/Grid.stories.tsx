import { expect } from 'storybook/test';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

import preview from '../../../.storybook/preview';
import { BLOCK_SELECTOR, Block } from './fixtures';

const meta = preview.meta({
  title: 'VRhythm/Audit/Grid',
  component: Block,
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

export const OnGrid = meta.story({
  args: { top: 16, height: 24 },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
});

export const OffGrid = meta.story({
  args: { top: 21, height: 19 },
  play: async ({ canvasElement }) => {
    const { violations } = await auditRhythm(canvasElement);

    await expect(violations).toEqual([
      {
        selector: BLOCK_SELECTOR,
        edge: 'top',
        actual: 21,
        nearest: 24,
        delta: -3,
      },
    ]);
    await expect(expectRhythm(canvasElement)).rejects.toThrow('delta -3px');
  },
});

export const GridFromPreset = meta.story({
  args: { top: 12, height: 24 },
  parameters: { vrhythm: { preset: '4px' } },
  play: async ({ canvasElement }) => {
    const { grid, ok, checked } = await auditRhythm(canvasElement);

    await expect(grid.lineHeight).toBe(4);
    await expect(checked).toBe(2);
    await expect(ok).toBe(true);
  },
});

export const GridWithOffset = meta.story({
  args: { top: 12, height: 8 },
  parameters: { vrhythm: { lineHeight: '8px', offset: '4px' } },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
});

export const NumericLineHeight = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { lineHeight: 8 } },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
});

export const HiddenOverlayNeedsOptions = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { hide: true } },
  play: async ({ canvasElement }) => {
    await expect(expectRhythm(canvasElement)).rejects.toThrow('No grid found');

    const { grid, ok, checked } = await auditRhythm(canvasElement, {
      lineHeight: '8px',
    });

    await expect(grid.origin).toBe(canvasElement.getBoundingClientRect().top);
    await expect(checked).toBe(2);
    await expect(ok).toBe(true);
  },
});
