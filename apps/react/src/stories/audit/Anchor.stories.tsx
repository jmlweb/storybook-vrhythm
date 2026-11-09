import { expect } from 'storybook/test';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

import preview from '../../../.storybook/preview';
import { BLOCK_SELECTOR, Block, expectOverlayOn, withRootAt } from './fixtures';

const meta = preview.meta({
  title: 'VRhythm/Audit/Anchor',
  component: Block,
  args: { top: 16, height: 24 },
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

// Includes half pixels, which a centered layout can produce.
const SHIFTED_ROOT_TOPS = [0, 16, 326, 326.5, 327];

export const OriginFollowsTheStoryRoot = meta.story({
  play: async ({ canvasElement }) => {
    for (const top of SHIFTED_ROOT_TOPS) {
      await withRootAt(top, async () => {
        await expectRhythm(canvasElement);
        await expectOverlayOn(canvasElement);
      });
    }
  },
});

export const OffsetFollowsTheStoryRoot = meta.story({
  args: { top: 12, height: 8 },
  parameters: { vrhythm: { lineHeight: '8px', offset: '4px' } },
  play: async ({ canvasElement }) => {
    await withRootAt(33, async () => {
      await expectRhythm(canvasElement);
      await expectOverlayOn(canvasElement, 4);
    });
  },
});

export const PageAnchor = meta.story({
  parameters: { vrhythm: { anchor: 'page' } },
  play: async ({ canvasElement }) => {
    await withRootAt(3, async () => {
      const { grid, ok } = await auditRhythm(canvasElement);

      await expect(grid.origin).toBe(0);
      await expect(ok).toBe(false);
    });
  },
});

export const PageAnchorOnPositionedBody = meta.story({
  parameters: { vrhythm: { anchor: 'page' } },
  play: async ({ canvasElement }) => {
    const { body } = document;
    body.style.position = 'relative';
    body.style.margin = '8px';
    try {
      const visible = await auditRhythm(canvasElement);
      const hidden = await auditRhythm(canvasElement, {
        lineHeight: '8px',
        anchor: 'page',
      });

      await expect(visible.grid.origin).toBe(8);
      await expect(hidden.grid.origin).toBe(visible.grid.origin);
    } finally {
      body.style.position = '';
      body.style.margin = '';
    }
  },
});

export const SelectorAnchor = meta.story({
  parameters: { vrhythm: { anchor: BLOCK_SELECTOR } },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector(BLOCK_SELECTOR);
    const { grid } = await auditRhythm(canvasElement, { edges: ['top'] });

    await expect(grid.origin).toBe(block?.getBoundingClientRect().top);
  },
});
