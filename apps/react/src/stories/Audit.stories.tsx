import { expect } from 'storybook/test';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

import preview from '../../.storybook/preview';

const Block = ({ top, height }: { top: number; height: number }) => (
  <div
    style={{ marginTop: top, height, background: '#eee' }}
    data-testid="block"
  />
);

const meta = preview.meta({
  title: 'VRhythm/Audit',
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
        selector: '[data-testid="block"]',
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

export const NumericOverlayLengths = meta.story({
  args: { top: 20, height: 24 },
  parameters: { vrhythm: { lineHeight: 8, lineWidth: 2, offset: 4 } },
  play: async ({ canvasElement }) => {
    const overlay = document.getElementById('storybook-rhythm');

    await expect(overlay?.style.top).toBe('4px');
    await expect(overlay?.style.backgroundImage).toContain('2px');
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

// Holds the measurement to the default tolerance, tighter than the 1px the README
// allows across fonts and platforms. Passes on macOS and on Ubuntu in CI.
const BASELINE_ACCURACY = 0.5;

const Probe = () => <span data-probe style={{ display: 'inline-block' }} />;

// An empty inline-block sits on the baseline, so it gives the browser's own answer.
const probeBaselines = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('[data-probe]')).map(
    (probe) => probe.getBoundingClientRect().bottom
  );

const auditBaselines = async (canvasElement: HTMLElement) => {
  // A huge grid at zero tolerance reports every baseline as a violation.
  const { grid, violations } = await auditRhythm(canvasElement, {
    lineHeight: 100000,
    tolerance: 0,
    checks: ['baseline'],
  });

  return violations.map(({ actual }) => actual + grid.origin);
};

const expectBaseline = (measured: number, expected: number) =>
  expect(Math.abs(measured - expected)).toBeLessThanOrEqual(BASELINE_ACCURACY);

const TEXT_STYLES = [
  { fontSize: 12 },
  { fontSize: 16 },
  { fontSize: 24 },
  { fontSize: 40 },
  { fontWeight: 'bold' },
  { fontStyle: 'italic' },
  { lineHeight: '32px' },
];

export const BaselineMatchesBrowser = meta.story({
  args: { top: 0, height: 0 },
  render: () => (
    <>
      {TEXT_STYLES.map((style) => (
        <p key={JSON.stringify(style)} style={{ ...style, margin: 0 }}>
          Baseline
          <Probe />
        </p>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const expected = probeBaselines(canvasElement);
    const measured = await auditBaselines(canvasElement);

    await expect(measured).toHaveLength(TEXT_STYLES.length);
    for (const [index, baseline] of measured.entries()) {
      await expectBaseline(baseline, expected[index]);
    }
  },
});

export const BaselineOfWrappedText = meta.story({
  args: { top: 0, height: 0 },
  render: () => (
    <p style={{ margin: 0, width: 'min-content' }}>
      <Probe />
      Three wrapped lines
      <Probe />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const [firstLine, lastLine] = probeBaselines(canvasElement);
    const measured = await auditBaselines(canvasElement);

    await expect(measured).toHaveLength(3);
    await expectBaseline(measured[0], firstLine);
    await expectBaseline(measured[2], lastLine);
  },
});

export const BaselineOfInlineElement = meta.story({
  args: { top: 0, height: 0 },
  render: () => (
    <p style={{ margin: 0 }}>
      Plain <em>emphasised</em>
      <Probe />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const [line] = probeBaselines(canvasElement);
    const measured = await auditBaselines(canvasElement);

    await expect(measured).toHaveLength(2);
    await expectBaseline(measured[0], line);
    await expectBaseline(measured[1], line);
  },
});
