import { expect, waitFor } from 'storybook/test';
import { expectRhythm } from 'storybook-vrhythm/audit';

import preview from '../../../.storybook/preview';
import { BLOCK_SELECTOR, Block, getOverlay } from './fixtures';

const meta = preview.meta({
  title: 'VRhythm/Audit/Overlay',
  component: Block,
  args: { top: 16, height: 24 },
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

export const NumericLengths = meta.story({
  args: { top: 20, height: 24 },
  parameters: { vrhythm: { lineHeight: 8, lineWidth: 2, offset: 4 } },
  play: async ({ canvasElement }) => {
    const overlay = getOverlay();

    await expect(overlay?.style.top).toContain('4px');
    await expect(overlay?.style.backgroundImage).toContain('2px');
    await expectRhythm(canvasElement);
  },
});

export const TallStory = meta.story({
  args: { top: 16, height: 4000 },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);

    const { scrollHeight } = document.documentElement;

    await expect(scrollHeight).toBeGreaterThan(window.innerHeight);
    await expect(getOverlay()?.getBoundingClientRect().height).toBe(
      scrollHeight
    );
  },
});

export const FollowsResize = meta.story({
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector<HTMLElement>(BLOCK_SELECTOR);
    if (block) {
      block.style.height = '4000px';
    }

    await waitFor(() =>
      expect(getOverlay()?.getBoundingClientRect().height).toBe(
        document.documentElement.scrollHeight
      )
    );
  },
});

export const MaxWidth = meta.story({
  parameters: { vrhythm: { maxWidth: '400px' } },
  play: async ({ canvasElement }) => {
    await expect(getOverlay()?.getBoundingClientRect().width).toBe(400);
    await expectRhythm(canvasElement);
  },
});

// Must stay right after MaxWidth: Vitest runs a file's stories in order, and
// this one checks that the reused overlay drops the styles MaxWidth set.
export const NoLeakAfterMaxWidth = meta.story({
  play: async () => {
    const overlay = getOverlay();

    await expect(overlay?.style.transform).toBe('');
    await expect(overlay?.getBoundingClientRect().width).toBe(
      document.documentElement.clientWidth
    );
  },
});
