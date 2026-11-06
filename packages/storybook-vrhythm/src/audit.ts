import {
  ANCHOR_DATA_KEY,
  ANCHOR_PAGE,
  ANCHOR_STORY,
  DIV_ID,
  LINE_HEIGHT_DATA_KEY,
  STORY_ROOT_ATTRIBUTE,
  UNKNOWN_PRESET_DATA_KEY,
} from './constants';
import type {
  RhythmGrid,
  RhythmMeasurement,
  RhythmViolation,
} from './find-violations';
import { findViolations } from './find-violations';
import {
  createError,
  RhythmErrorCode,
  toAssertionError,
} from './rhythm-errors';
import {
  isAnchorMissing,
  measurePageTop,
  queryOrNull,
  resolveAnchor,
  syncOverlay,
} from './utils';

export type {
  RhythmEdge,
  RhythmGrid,
  RhythmViolation,
} from './find-violations';

export type {
  RhythmAssertionError,
  RhythmConfigError,
} from './rhythm-errors';
export { RhythmErrorCode } from './rhythm-errors';

export type RhythmCheck = 'box' | 'baseline';

export type RhythmBoxEdge = 'top' | 'bottom';

export interface AuditOptions {
  /** Grid size (`px`, `rem`, or a number of pixels). Default: read from the overlay. */
  lineHeight?: string | number;
  /**
   * Grid start below the top of `root`, or of `anchor` when set. This differs
   * from the story's `offset`, which is always relative to the story's anchor.
   * When set, it replaces the overlay's position as the origin. Default: the
   * overlay's top, or the top of `root` when there is no overlay.
   */
  offset?: string | number;
  /**
   * What `offset` is measured from: `'story'`, `'page'` or a selector. When set,
   * it replaces the overlay's position as the origin, so a hidden overlay can
   * audit the same grid as a visible one. Default: `root`
   */
  anchor?: 'story' | 'page' | (string & {});
  /**
   * Allowed distance from a grid line, in pixels. Must be finite, 0 or more, and
   * under half of `lineHeight`, because no layout could fail a wider one.
   * Default: `0.5`
   */
  tolerance?: number;
  /** What to measure. Default: `['box']` */
  checks?: readonly RhythmCheck[];
  /**
   * Which box edges to measure, for the `box` check. Checking `['top']` misses a
   * wrong height. Default: `['top', 'bottom']`
   */
  edges?: readonly RhythmBoxEdge[];
  /** Selector for elements to skip, on top of `[data-vrhythm-ignore]`. */
  ignore?: string;
}

export interface RhythmReport {
  ok: boolean;
  grid: RhythmGrid;
  /**
   * Edges and baselines measured, after `checks`, `edges` and `ignore` apply.
   * `0` means nothing was tested.
   */
  checked: number;
  violations: RhythmViolation[];
}

const DEFAULT_TOLERANCE = 0.5;
const IGNORE_SELECTOR = '[data-vrhythm-ignore]';
const DEFAULT_EDGES: readonly RhythmBoxEdge[] = ['top', 'bottom'];
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

const toPixels = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (value.trim() === '0') {
    return 0;
  }

  const match = LENGTH_PATTERN.exec(value.trim());
  if (!match) {
    return Number.NaN;
  }

  const size = Number(match[1]);
  return match[2] === 'rem'
    ? size * parseFloat(getComputedStyle(document.documentElement).fontSize)
    : size;
};

// A non-finite grid turns every delta into NaN, which no tolerance check can flag.
const parseLength = (
  value: string | number,
  option: string,
  source = ''
): number => {
  const pixels = toPixels(value);
  if (!Number.isFinite(pixels)) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.INVALID_LENGTH,
      `Unsupported ${option}${source} "${value}": set the ${option} option in px, rem, or a number of pixels.`
    );
  }

  return pixels;
};

const anchorNotFound = (anchor: string | undefined): Error =>
  createError(
    'RhythmConfigError',
    RhythmErrorCode.ANCHOR_NOT_FOUND,
    `The anchor "${anchor}" matches no element. Fix the anchor selector.`
  );

// The overlay can lag the layout by a frame, and the origin must be exact now.
const syncToAnchor = (overlay: HTMLElement, root: Element): void => {
  const anchor = resolveAnchor(overlay, root);
  if (isAnchorMissing(overlay, anchor)) {
    throw anchorNotFound(overlay.dataset[ANCHOR_DATA_KEY]);
  }
  syncOverlay(overlay, anchor);
};

const resolveExplicitBase = (root: Element, anchor?: string): number => {
  if (anchor === undefined) {
    return root.getBoundingClientRect().top;
  }
  if (anchor === ANCHOR_PAGE) {
    return measurePageTop();
  }

  const element =
    anchor === ANCHOR_STORY
      ? (root.closest(`[${STORY_ROOT_ATTRIBUTE}]`) ?? root)
      : queryOrNull(anchor);
  if (!element) {
    throw anchorNotFound(anchor);
  }
  return element.getBoundingClientRect().top;
};

const assertUsableOverlay = (overlay: Element, root: Element): void => {
  const area = overlay.getBoundingClientRect();
  const box = root.getBoundingClientRect();
  // An empty root has nothing to compare with, and `checked` reports it instead.
  if (!box.height) {
    return;
  }

  if (!area.height || !area.width) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.UNUSABLE_OVERLAY,
      `The overlay has no area (${area.width}x${area.height}px), so its position is not a grid. Check offset and maxWidth, or pass the offset option.`
    );
  }
  if (area.top > box.bottom || area.bottom < box.top) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.UNUSABLE_OVERLAY,
      `The overlay (y=${area.top} to ${area.bottom}) lies outside root (y=${box.top} to ${box.bottom}). Check offset and anchor.`
    );
  }
};

const resolveGrid = (root: Element, options: AuditOptions): RhythmGrid => {
  const overlay = document.getElementById(DIV_ID);
  const hasExplicitOrigin =
    options.offset !== undefined || options.anchor !== undefined;
  const unknownPreset = overlay?.dataset[UNKNOWN_PRESET_DATA_KEY];
  if (unknownPreset) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.UNKNOWN_PRESET,
      `Unknown preset "${unknownPreset}": the overlay fell back to its default grid. Fix the preset name.`
    );
  }

  const lineHeightSource =
    options.lineHeight ?? overlay?.dataset[LINE_HEIGHT_DATA_KEY];

  if (lineHeightSource === undefined) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.NO_GRID,
      'No grid found: there is no overlay, because it is hidden or the addon is not registered. Pass the lineHeight option.'
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
      RhythmErrorCode.INVALID_LENGTH,
      `lineHeight must be greater than 0, got "${lineHeightSource}".`
    );
  }

  if (hasExplicitOrigin) {
    return {
      lineHeight,
      origin:
        resolveExplicitBase(root, options.anchor) +
        parseLength(options.offset ?? 0, 'offset'),
    };
  }
  if (!overlay) {
    return { lineHeight, origin: root.getBoundingClientRect().top };
  }

  syncToAnchor(overlay, root);
  assertUsableOverlay(overlay, root);

  return { lineHeight, origin: overlay.getBoundingClientRect().top };
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
      RhythmErrorCode.UNMEASURABLE,
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
  boxEdges: readonly RhythmBoxEdge[],
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
        ({ edge, y }) =>
          boxEdges.includes(edge) && !parentEdges.has(`${edge}:${y}`)
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
    ...(root.matches(ignoreSelector)
      ? []
      : measureBaselines(
          root,
          getComputedStyle(root),
          () => describeAnchor(root) ?? describeStep(root)
        )),
    ...Array.from(root.children).flatMap((child) => walk(child, new Set())),
  ];
};

const assertValidIgnore = (root: Element, ignore?: string): void => {
  if (!ignore) {
    return;
  }

  try {
    root.matches(ignore);
  } catch {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.INVALID_SELECTOR,
      `ignore is not a valid selector: "${ignore}".`
    );
  }
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

  const {
    tolerance = DEFAULT_TOLERANCE,
    checks = ['box'],
    edges = DEFAULT_EDGES,
    ignore,
  } = options;
  if (edges.length === 0) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.INVALID_EDGES,
      'edges must name at least one of top or bottom: an empty list measures no box.'
    );
  }
  if (!Number.isFinite(tolerance) || tolerance < 0) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.INVALID_TOLERANCE,
      `tolerance must be a finite number of pixels, 0 or more, got "${tolerance}".`
    );
  }

  assertValidIgnore(root, ignore);

  const grid = resolveGrid(root, options);
  // Nothing can sit further than half a line from the nearest grid line.
  if (tolerance >= grid.lineHeight / 2) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.INVALID_TOLERANCE,
      `tolerance must be under half of lineHeight, got ${tolerance} on a ${grid.lineHeight}px grid: no layout could fail.`
    );
  }

  const ignoreSelector = ignore
    ? `${IGNORE_SELECTOR}, ${ignore}`
    : IGNORE_SELECTOR;
  const measurements = collectMeasurements(root, checks, edges, ignoreSelector);
  // A NaN delta passes every tolerance check, so it must not reach findViolations.
  const unmeasurable = measurements.find(
    ({ y }) => !Number.isFinite(y - grid.origin)
  );
  if (unmeasurable) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.UNMEASURABLE,
      `Could not measure ${unmeasurable.selector} ${unmeasurable.edge}: got "${unmeasurable.y}" against origin "${grid.origin}". This environment lacks the layout or font metrics the audit needs.`
    );
  }

  const violations = findViolations(measurements, grid, tolerance);

  return {
    ok: violations.length === 0,
    grid,
    checked: measurements.length,
    violations,
  };
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
  const error = toAssertionError(await auditRhythm(root, options));

  if (error) {
    throw error;
  }
};
