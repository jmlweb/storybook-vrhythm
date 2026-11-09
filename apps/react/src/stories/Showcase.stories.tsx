import { expect } from 'storybook/test';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

import preview from '../../.storybook/preview';
import { ArticleCard } from './article-card';

const meta = preview.meta({
  title: 'VRhythm/Showcase',
  component: ArticleCard,
  parameters: {
    layout: 'padded',
    vrhythm: {
      lineHeight: '8px',
      color: 'rgba(236, 72, 153, 0.6)',
      opacity: 0.6,
    },
  },
});

export { meta as default };

export const OnGrid = meta.story({
  parameters: { vrhythm: { audit: 'error' } },
});

// Shows what an agent reads when a story drifts: the failure names the
// highest off-grid edge, so it can be fixed without a screenshot.
export const OffGrid = meta.story({
  args: { isOffGrid: true },
  play: async ({ canvasElement }) => {
    const { ok, violations } = await auditRhythm(canvasElement);

    await expect(ok).toBe(false);
    // The heading is 2px short per line. Fonts differ per OS, so the line
    // count and the exact delta do too; the sign and the edge do not.
    const heading = violations.find(
      (violation) =>
        violation.selector === '[data-testid="heading"]' &&
        violation.edge === 'bottom'
    );
    await expect(heading?.delta).toBeLessThan(0);
    await expect(expectRhythm(canvasElement)).rejects.toThrow('heading');
  },
});
