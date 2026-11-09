import type { Meta, StoryObj } from '@storybook/html';
import { expect } from 'storybook/test';
import 'storybook-vrhythm';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

interface NoteArgs {
  isOffGrid: boolean;
}

// Every edge lands on the 8px grid. The off-grid body line is 26px, so the
// body ends 2px past a line.
const meta: Meta<NoteArgs> = {
  title: 'VRhythm/Smoke',
  args: { isOffGrid: false },
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
  render: ({ isOffGrid }) => {
    const section = document.createElement('section');
    section.style.cssText =
      'padding: 16px 0; font-family: system-ui, sans-serif;';
    section.innerHTML = `
      <p style="margin: 0; font-size: 16px; line-height: 24px; font-weight: 600;">Rendered by plain HTML</p>
      <p data-testid="body" style="margin: 8px 0 0; font-size: 16px; line-height: ${isOffGrid ? 26 : 24}px;">
        The overlay and the audit work with classic main.ts registration.
      </p>`;
    return section;
  },
};

// Storybook 10's Vitest transform cannot read `export { meta as default }` in
// classic CSF, so this file keeps a plain default export.
export default meta;

type Story = StoryObj<NoteArgs>;

export const OnGrid: Story = {
  parameters: { vrhythm: { audit: 'error' } },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
};

export const OffGrid: Story = {
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
};

export const Hidden: Story = {
  parameters: { vrhythm: { hide: true } },
  play: async () => {
    await expect(document.getElementById('storybook-rhythm')).toBeNull();
  },
};
