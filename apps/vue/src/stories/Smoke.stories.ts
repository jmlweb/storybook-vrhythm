import { expect } from 'storybook/test';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';
import { defineComponent } from 'vue';

import preview from '../../.storybook/preview';

// Every edge lands on the 8px grid. The off-grid body line is 26px, so the
// body ends 2px past a line.
const Note = defineComponent({
  props: { isOffGrid: { type: Boolean, default: false } },
  template: `<section style="padding: 16px 0; font-family: system-ui, sans-serif;">
    <p style="margin: 0; font-size: 16px; line-height: 24px; font-weight: 600;">Rendered by Vue</p>
    <p data-testid="body" :style="{ margin: '8px 0 0', fontSize: '16px', lineHeight: isOffGrid ? '26px' : '24px' }">
      The overlay and the audit work on this framework.
    </p>
  </section>`,
});

const meta = preview.meta({
  title: 'VRhythm/Smoke',
  component: Note,
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

export const OnGrid = meta.story({
  parameters: { vrhythm: { audit: 'error' } },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
});

export const OffGrid = meta.story({
  args: { isOffGrid: true },
  play: async ({ canvasElement }) => {
    const { violations } = await auditRhythm(canvasElement);

    await expect(violations).toContainEqual(
      expect.objectContaining({
        selector: '[data-testid="body"]',
        edge: 'bottom',
        delta: 2,
      })
    );
  },
});

export const Hidden = meta.story({
  parameters: { vrhythm: { hide: true } },
  // A seeded overlay makes the check prove the decorator ran and removed it.
  beforeEach: () => {
    if (!document.getElementById('storybook-rhythm')) {
      const overlay = document.createElement('div');
      overlay.id = 'storybook-rhythm';
      document.body.append(overlay);
    }
  },
  play: async () => {
    await expect(document.getElementById('storybook-rhythm')).toBeNull();
  },
});
