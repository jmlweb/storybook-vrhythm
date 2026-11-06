import { DIV_ID, LINE_HEIGHT_DATA_KEY } from './constants';
import type {
  RhythmGrid,
  RhythmMeasurement,
  RhythmViolation,
} from './find-violations';
import { findViolations, roundPx } from './find-violations';

export type {
  RhythmEdge,
  RhythmGrid,
  RhythmViolation,
} from './find-violations';

export type RhythmCheck = 'box' | 'baseline';

export interface AuditOptions {
  /** Grid size (`px`, `rem`, or a number of pixels). Default: read from the overlay. */
  lineHeight?: string | number;
  /**
   * Grid start below the top of `root`. When set, it replaces the overlay's
   * position as the origin. This differs from the story's `offset`, which is
   * measured from the overlay's containing block. Default: the overlay's top,
   * or the top of `root` when there is no overlay.
   */
  offset?: string | number;
  /** Allowed distance from a grid line, in pixels. Default: `0.5` */
  tolerance?: number;
  /** What to measure. Default: `['box']` */
  checks?: readonly RhythmCheck[];
  /** Selector for elements to skip, on top of `[data-vrhythm-ignore]`. */
  ignore?: string;
}

export type RhythmAssertionError = Error & { report: RhythmReport };

export interface RhythmReport {
  ok: boolean;
  grid: RhythmGrid;
  /** Edges and baselines measured. `0` means nothing was tested. */
  checked: number;
  violations: RhythmViolation[];
}

const DEFAULT_TOLERANCE = 0.5;
const IGNORE_SELECTOR = '[data-vrhythm-ignore]';
const MAX_REPORTED_VIOLATIONS = 10;
const LENGTH_PATTERN = /^(-?\d*\.?\d+)(px|rem)$/;
const SAFE_IDENTIFIER = /^[A-Za-z][\w-]*$/;
// Inline boxes fragment across lines, these don't. Inline `svg` stays out: it is
// nearly always an icon, centred on the text rather than placed on the grid.
const REPLACED_TAGS = new Set([
  'IMG',
  'VIDEO',
  'CANVAS',
  'IFRAME',
  'OBJECT',
  'EMBED',
]);

const createError = <T extends object>(
  name: string,
  message: string,
  details?: T
): Error & T => Object.assign(new Error(message), { name }, details);

const parseLength = (
  value: string | number,
  option: string,
  source = ''
): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (value.trim() === '0') {
    return 0;
  }

  const match = LENGTH_PATTERN.exec(value.trim());
  if (!match) {
    throw createError(
      'RhythmConfigError',
      `Unsupported ${option}${source} "${value}": set the ${option} option in px, rem, or a number of pixels.`
    );
  }

  const size = Number(match[1]);
  return match[2] === 'rem'
    ? size * parseFloat(getComputedStyle(document.documentElement).fontSize)
    : size;
};

const resolveGrid = (root: Element, options: AuditOptions): RhythmGrid => {
  const overlay = document.getElementById(DIV_ID);
  const lineHeightSource =
    options.lineHeight ?? overlay?.dataset[LINE_HEIGHT_DATA_KEY];

  if (lineHeightSource === undefined) {
    throw createError(
      'RhythmConfigError',
      'No grid found: the overlay is hidden or missing. Pass the lineHeight option.'
    );
  }

  const lineHeight = parseLength(
    lineHeightSource,
    'lineHeight',
    options.lineHeight === undefined ? ' from the overlay' : ''
  );
  if (!(lineHeight > 0)) {
    throw createError(
      'RhythmConfigError',
      `lineHeight must be greater than 0, got "${lineHeightSource}".`
    );
  }

  const rootTop = root.getBoundingClientRect().top;
  const origin =
    options.offset !== undefined
      ? rootTop + parseLength(options.offset, 'offset')
      : (overlay?.getBoundingClientRect().top ?? rootTop);

  return { lineHeight, origin };
};

const describeStep = (element: Element): string => {
  const tag = element.tagName.toLowerCase();
  const safeClass = Array.from(element.classList).find((name) =>
    SAFE_IDENTIFIER.test(name)
  );
  const className = safeClass ? `.${safeClass}` : '';
  const sameTagSiblings = Array.from(
    element.parentElement?.children ?? []
  ).filter(({ tagName }) => tagName === element.tagName);
  const position =
    sameTagSiblings.length > 1
      ? `:nth-of-type(${sameTagSiblings.indexOf(element) + 1})`
      : '';

  return `${tag}${className}${position}`;
};

const describeAnchor = (element: Element): string | null => {
  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `[data-testid=${JSON.stringify(testId)}]`;
  }
  return SAFE_IDENTIFIER.test(element.id) ? `#${element.id}` : null;
};

const describeElement = (element: Element, root: Element): string => {
  const anchor = describeAnchor(element);
  if (anchor) {
    return anchor;
  }

  const parent = element.parentElement;
  return parent && parent !== root
    ? `${describeElement(parent, root)} > ${describeStep(element)}`
    : describeStep(element);
};

type MeasureText = (element: Element, style: CSSStyleDeclaration) => number[];

const createTextMeasurer = (): MeasureText => {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    throw createError(
      'RhythmConfigError',
      'The baseline check needs canvas 2D, which this environment lacks.'
    );
  }

  return (element, style) => {
    const textNodes = Array.from(element.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    );
    if (textNodes.length === 0) {
      return [];
    }

    // The computed `font` shorthand is empty in some browsers.
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const ascent = context.measureText('x').fontBoundingBoxAscent;

    // A text rect spans the font's ascent and descent, so baseline = top + ascent.
    return textNodes.flatMap((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const lineTops = Array.from(range.getClientRects())
        .filter(({ width }) => width > 0)
        .map(({ top }) => top);

      // Mixed inline content can split one line into rects a fraction apart.
      const uniqueTops = new Set(
        lineTops.map((top) => Math.round(top * 100) / 100)
      );

      return [...uniqueTops].map((top) => top + ascent);
    });
  };
};

const collectMeasurements = (
  root: Element,
  checks: readonly RhythmCheck[],
  ignoreSelector: string
): RhythmMeasurement[] => {
  const hasBoxCheck = checks.includes('box');
  const measureText = checks.includes('baseline') ? createTextMeasurer() : null;

  const measureBox = (
    element: Element,
    style: CSSStyleDeclaration,
    parentEdges: ReadonlySet<string>
  ): { measurements: RhythmMeasurement[]; edges: ReadonlySet<string> } => {
    const { top, bottom, width, height } = element.getBoundingClientRect();
    const isFragmented =
      style.display === 'inline' && !REPLACED_TAGS.has(element.tagName);
    if (!hasBoxCheck || isFragmented || !width || !height) {
      return { measurements: [], edges: parentEdges };
    }

    const selector = describeElement(element, root);
    const edges = [
      { selector, edge: 'top', y: top },
      { selector, edge: 'bottom', y: bottom },
    ] as const;

    return {
      // A wrapper and its only child share edges: report the wrapper alone.
      measurements: edges.filter(
        ({ edge, y }) => !parentEdges.has(`${edge}:${y}`)
      ),
      edges: new Set([
        ...parentEdges,
        ...edges.map(({ edge, y }) => `${edge}:${y}`),
      ]),
    };
  };

  const measureBaselines = (
    element: Element,
    style: CSSStyleDeclaration,
    describe: () => string
  ): RhythmMeasurement[] =>
    (measureText?.(element, style) ?? []).map((y) => ({
      selector: describe(),
      edge: 'baseline',
      y,
    }));

  const walk = (
    element: Element,
    parentEdges: ReadonlySet<string>
  ): RhythmMeasurement[] => {
    if (element.id === DIV_ID || element.matches(ignoreSelector)) {
      return [];
    }

    const style = getComputedStyle(element);
    if (style.display === 'none') {
      return [];
    }

    const isVisible = style.visibility !== 'hidden';
    const { measurements, edges } = isVisible
      ? measureBox(element, style, parentEdges)
      : { measurements: [], edges: parentEdges };
    const baselines = isVisible
      ? measureBaselines(element, style, () => describeElement(element, root))
      : [];

    return [
      ...measurements,
      ...baselines,
      ...Array.from(element.children).flatMap((child) => walk(child, edges)),
    ];
  };

  return [
    // `root` gets no box check, but a story may render bare text straight into it.
    ...measureBaselines(
      root,
      getComputedStyle(root),
      () => describeAnchor(root) ?? describeStep(root)
    ),
    ...Array.from(root.children).flatMap((child) => walk(child, new Set())),
  ];
};

const waitForFonts = async (): Promise<void> => {
  // Layout shifts when web fonts swap in, and jsdom has no FontFaceSet.
  if ('fonts' in document) {
    await document.fonts.ready;
  }
};

/**
 * Measures the descendants of `root` against the baseline grid.
 *
 * Reads the grid from the `#storybook-rhythm` overlay unless options override
 * it. Needs a real browser: without layout, every element measures as empty and
 * `checked` is `0`.
 */
export const auditRhythm = async (
  root: Element,
  options: AuditOptions = {}
): Promise<RhythmReport> => {
  await waitForFonts();

  const { tolerance = DEFAULT_TOLERANCE, checks = ['box'], ignore } = options;
  const grid = resolveGrid(root, options);
  const ignoreSelector = ignore
    ? `${IGNORE_SELECTOR}, ${ignore}`
    : IGNORE_SELECTOR;
  const measurements = collectMeasurements(root, checks, ignoreSelector);
  const violations = findViolations(measurements, grid, tolerance);

  return {
    ok: violations.length === 0,
    grid,
    checked: measurements.length,
    violations,
  };
};

const formatViolation = ({
  selector,
  edge,
  actual,
  nearest,
  delta,
}: RhythmViolation): string =>
  `  ${selector} ${edge}: ${actual}px, nearest ${nearest}px (delta ${delta}px)`;

const formatFailure = ({ grid, violations }: RhythmReport): string => {
  const hiddenCount = violations.length - MAX_REPORTED_VIOLATIONS;

  return [
    `Expected elements on the ${grid.lineHeight}px grid starting at y=${roundPx(grid.origin)}px, found ${violations.length} off-grid:`,
    ...violations.slice(0, MAX_REPORTED_VIOLATIONS).map(formatViolation),
    ...(hiddenCount > 0 ? [`  ...and ${hiddenCount} more`] : []),
  ].join('\n');
};

/**
 * Throws when any descendant of `root` is off the baseline grid, or when
 * nothing could be measured. The error's `report` holds the full result.
 *
 * ```ts
 * export const Card = {
 *   play: async ({ canvasElement }) => {
 *     await expectRhythm(canvasElement);
 *   },
 * };
 * ```
 */
export const expectRhythm = async (
  root: Element,
  options?: AuditOptions
): Promise<void> => {
  const report = await auditRhythm(root, options);

  if (report.checked === 0) {
    throw createError(
      'RhythmAssertionError',
      'Nothing was measured, so rhythm cannot be asserted. Check that root has rendered content and the environment has layout (jsdom does not).',
      { report }
    );
  }
  if (!report.ok) {
    throw createError('RhythmAssertionError', formatFailure(report), {
      report,
    });
  }
};
