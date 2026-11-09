import { expect } from 'storybook/test';
import { auditRhythm } from 'storybook-vrhythm/audit';

import preview from '../../.storybook/preview';
import { ArticleCard } from './article-card';

const getOverlay = () => document.getElementById('storybook-rhythm');

const expectGridOf = async (
  canvasElement: HTMLElement,
  lineHeight: number,
  offset = 0
) => {
  const { grid } = await auditRhythm(canvasElement);

  await expect(grid.lineHeight).toBe(lineHeight);
  await expect(grid.origin).toBe(
    canvasElement.getBoundingClientRect().top + offset
  );
};

// One story per kind of option. docs/reference.md lists every value.
const meta = preview.meta({
  title: 'VRhythm/Options',
  component: ArticleCard,
  parameters: { layout: 'padded' },
});

export { meta as default };

export const Default = meta.story({
  play: async ({ canvasElement }) => {
    await expectGridOf(canvasElement, 16);
  },
});

export const Preset = meta.story({
  parameters: { vrhythm: { preset: '24px' } },
  play: async ({ canvasElement }) => {
    await expectGridOf(canvasElement, 24);
  },
});

export const PresetAlias = meta.story({
  parameters: { vrhythm: { preset: 'carbon' } },
  play: async ({ canvasElement }) => {
    await expectGridOf(canvasElement, 8);
  },
});

export const PresetWithOverrides = meta.story({
  parameters: { vrhythm: { preset: 'carbon', lineHeight: '4px' } },
  play: async ({ canvasElement }) => {
    await expectGridOf(canvasElement, 4);
  },
});

export const CustomLook = meta.story({
  parameters: {
    vrhythm: {
      lineHeight: '8px',
      offset: '4px',
      color: 'rgba(0, 200, 100, 0.25)',
      opacity: 0.6,
    },
  },
  play: async ({ canvasElement }) => {
    await expectGridOf(canvasElement, 8, 4);
    await expect(getOverlay()?.style.opacity).toBe('0.6');
  },
});

export const Hidden = meta.story({
  parameters: { vrhythm: { hide: true } },
  play: async () => {
    await expect(getOverlay()).toBeNull();
  },
});
