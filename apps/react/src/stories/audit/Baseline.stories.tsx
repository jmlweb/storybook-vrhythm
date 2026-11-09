import { expect } from 'storybook/test';
import { auditRhythm } from 'storybook-vrhythm/audit';

import preview from '../../../.storybook/preview';

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

const meta = preview.meta({
  title: 'VRhythm/Audit/Baseline',
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

export const MatchesBrowser = meta.story({
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

export const WrappedText = meta.story({
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

export const InlineElement = meta.story({
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
