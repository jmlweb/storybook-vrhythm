import { expect } from 'storybook/test';
import { auditRhythm } from 'storybook-vrhythm/audit';

import preview from '../../../.storybook/preview';
import { Block } from './fixtures';

const meta = preview.meta({
  title: 'VRhythm/Audit/Errors',
  component: Block,
  args: { top: 16, height: 24 },
  parameters: { layout: 'fullscreen' },
});

export { meta as default };

export const OffsetOutsideTheRoot = meta.story({
  parameters: { vrhythm: { preset: '8px', offset: 100000 } },
  play: async ({ canvasElement }) => {
    await expect(auditRhythm(canvasElement)).rejects.toMatchObject({
      code: 'UNUSABLE_OVERLAY',
    });
  },
});

export const UnknownPreset = meta.story({
  parameters: { vrhythm: { preset: 'nope' } },
  play: async ({ canvasElement }) => {
    await expect(auditRhythm(canvasElement)).rejects.toMatchObject({
      code: 'UNKNOWN_PRESET',
    });
  },
});
