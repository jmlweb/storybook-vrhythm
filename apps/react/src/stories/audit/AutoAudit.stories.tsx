import { expect } from 'storybook/test';
import { auditRhythm } from 'storybook-vrhythm/audit';

import preview from '../../../.storybook/preview';
import { Block } from './fixtures';

// The addon's afterEach runs the audit after play, and Storybook runs a story's
// own afterEach before it, so no story here can observe the result.
// test/auto-audit.test.ts covers what each mode does with it.
const meta = preview.meta({
  title: 'VRhythm/Audit/AutoAudit',
  component: Block,
  args: { top: 16, height: 24 },
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

export const ErrorMode = meta.story({
  parameters: { vrhythm: { audit: 'error' } },
});

export const ErrorModeWithHiddenOverlay = meta.story({
  parameters: { vrhythm: { audit: 'error', hide: true } },
});

export const TodoMode = meta.story({
  args: { top: 21, height: 19 },
  parameters: { vrhythm: { audit: 'todo' } },
  // Proves the story passes because todo mode does not fail it, not because
  // the fixture happens to be on the grid.
  play: async ({ canvasElement }) => {
    const { ok } = await auditRhythm(canvasElement);

    await expect(ok).toBe(false);
  },
});
