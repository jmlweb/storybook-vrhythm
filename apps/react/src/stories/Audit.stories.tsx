import { expect, waitFor } from 'storybook/test';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

import preview from '../../.storybook/preview';

// A top margin would collapse through the root and move the origin with it.
const Block = ({ top, height }: { top: number; height: number }) => (
  <div
    style={{ position: 'relative', top, height, background: '#eee' }}
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

    await expect(overlay?.style.top).toContain('4px');
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

const originOf = (canvasElement: HTMLElement) =>
  canvasElement.getBoundingClientRect().top;

const expectOverlayOn = async (canvasElement: HTMLElement, offset = 0) => {
  const { grid } = await auditRhythm(canvasElement);
  const overlay = document.getElementById('storybook-rhythm');
  const overlayTop = overlay?.getBoundingClientRect().top;

  await expect(grid.origin).toBe(originOf(canvasElement) + offset);
  await expect(overlayTop).toBe(grid.origin);
};

// Stands in for layouts that place the root anywhere, including half pixels.
const SHIFTED_ROOT_TOPS = [0, 16, 326, 326.5, 327];

const withRootAt = async (top: number, check: () => Promise<void>) => {
  document.body.style.paddingTop = `${top}px`;
  try {
    await check();
  } finally {
    document.body.style.paddingTop = '';
  }
};

export const OriginFollowsTheStoryRoot = meta.story({
  args: { top: 16, height: 24 },
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
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', anchor: 'page' } },
  play: async ({ canvasElement }) => {
    await withRootAt(3, async () => {
      const { grid, ok } = await auditRhythm(canvasElement);

      await expect(grid.origin).toBe(0);
      await expect(ok).toBe(false);
    });
  },
});

export const PageAnchorOnPositionedBody = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', anchor: 'page' } },
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
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', anchor: '[data-testid="block"]' } },
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('[data-testid="block"]');
    const { grid } = await auditRhythm(canvasElement, { edges: ['top'] });

    await expect(grid.origin).toBe(block?.getBoundingClientRect().top);
  },
});

export const TallStory = meta.story({
  args: { top: 16, height: 4000 },
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);

    const overlay = document.getElementById('storybook-rhythm');
    const { scrollHeight } = document.documentElement;

    await expect(scrollHeight).toBeGreaterThan(window.innerHeight);
    await expect(overlay?.getBoundingClientRect().height).toBe(scrollHeight);
  },
});

export const OverlayFollowsResize = meta.story({
  args: { top: 16, height: 24 },
  play: async ({ canvasElement }) => {
    const overlay = document.getElementById('storybook-rhythm');
    const block = canvasElement.querySelector<HTMLElement>(
      '[data-testid="block"]'
    );
    if (block) {
      block.style.height = '4000px';
    }

    await waitFor(() =>
      expect(overlay?.getBoundingClientRect().height).toBe(
        document.documentElement.scrollHeight
      )
    );
  },
});

export const MaxWidthDoesNotLeak = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', maxWidth: '400px' } },
  play: async ({ canvasElement }) => {
    const overlay = document.getElementById('storybook-rhythm');

    await expect(overlay?.getBoundingClientRect().width).toBe(400);
    await expectRhythm(canvasElement);
  },
});

export const NoLeakAfterMaxWidth = meta.story({
  args: { top: 16, height: 24 },
  play: async () => {
    const overlay = document.getElementById('storybook-rhythm');

    await expect(overlay?.style.transform).toBe('');
    await expect(overlay?.getBoundingClientRect().width).toBe(
      document.documentElement.clientWidth
    );
  },
});

export const OffsetOutsideTheRootIsRejected = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', offset: 100000 } },
  play: async ({ canvasElement }) => {
    await expect(auditRhythm(canvasElement)).rejects.toMatchObject({
      code: 'UNUSABLE_OVERLAY',
    });
  },
});

export const UnknownPresetIsRejected = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: 'nope' } },
  play: async ({ canvasElement }) => {
    await expect(auditRhythm(canvasElement)).rejects.toMatchObject({
      code: 'UNKNOWN_PRESET',
    });
  },
});

export const AutomaticAudit = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', audit: 'error' } },
});

export const AutomaticAuditWithHiddenOverlay = meta.story({
  args: { top: 16, height: 24 },
  parameters: { vrhythm: { preset: '8px', audit: 'error', hide: true } },
});

export const AutomaticAuditTodo = meta.story({
  args: { top: 21, height: 19 },
  parameters: { vrhythm: { preset: '8px', audit: 'todo' } },
});
