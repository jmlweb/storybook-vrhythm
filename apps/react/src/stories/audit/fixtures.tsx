import { expect } from 'storybook/test';
import { auditRhythm } from 'storybook-vrhythm/audit';

// A top margin would collapse through the root and move the origin with it.
export const Block = ({ top, height }: { top: number; height: number }) => (
  <div
    style={{ position: 'relative', top, height, background: '#eee' }}
    data-testid="block"
  />
);

export const BLOCK_SELECTOR = '[data-testid="block"]';

export const getOverlay = () => document.getElementById('storybook-rhythm');

export const originOf = (canvasElement: HTMLElement) =>
  canvasElement.getBoundingClientRect().top;

export const expectOverlayOn = async (
  canvasElement: HTMLElement,
  offset = 0
) => {
  const { grid } = await auditRhythm(canvasElement);
  const overlayTop = getOverlay()?.getBoundingClientRect().top;

  await expect(grid.origin).toBe(originOf(canvasElement) + offset);
  await expect(overlayTop).toBe(grid.origin);
};

// Vitest does not apply Storybook layouts, so body padding stands in for
// layouts that place the root anywhere.
export const withRootAt = async (top: number, check: () => Promise<void>) => {
  document.body.style.paddingTop = `${top}px`;
  try {
    await check();
  } finally {
    document.body.style.paddingTop = '';
  }
};
