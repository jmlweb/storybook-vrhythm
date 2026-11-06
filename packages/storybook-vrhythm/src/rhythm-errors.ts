import type { RhythmReport } from './audit';
import type { RhythmViolation } from './find-violations';
import { roundPx } from './find-violations';

/** Stable identifiers for audit errors. Branch on these, not on messages. */
export const RhythmErrorCode = {
  NO_GRID: 'NO_GRID',
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_TOLERANCE: 'INVALID_TOLERANCE',
  INVALID_EDGES: 'INVALID_EDGES',
  INVALID_SELECTOR: 'INVALID_SELECTOR',
  UNKNOWN_PRESET: 'UNKNOWN_PRESET',
  ANCHOR_NOT_FOUND: 'ANCHOR_NOT_FOUND',
  UNUSABLE_OVERLAY: 'UNUSABLE_OVERLAY',
  UNMEASURABLE: 'UNMEASURABLE',
  NOTHING_MEASURED: 'NOTHING_MEASURED',
  OFF_GRID: 'OFF_GRID',
} as const;

export type RhythmErrorCode =
  (typeof RhythmErrorCode)[keyof typeof RhythmErrorCode];

type RhythmAssertionCode = Extract<
  RhythmErrorCode,
  'OFF_GRID' | 'NOTHING_MEASURED'
>;

export type RhythmConfigError = Error & {
  code: Exclude<RhythmErrorCode, RhythmAssertionCode>;
};

export type RhythmAssertionError = Error & {
  code: RhythmAssertionCode;
  report: RhythmReport;
};

const MAX_REPORTED_VIOLATIONS = 10;

export const createError = <T extends object>(
  name: string,
  code: RhythmErrorCode,
  message: string,
  details?: T
): Error & { code: RhythmErrorCode } & T =>
  Object.assign(new Error(message), { name, code }, details);

const groupByDelta = (
  violations: readonly RhythmViolation[]
): Map<number, RhythmViolation[]> =>
  violations.reduce(
    (groups, violation) =>
      groups.set(violation.delta, [
        ...(groups.get(violation.delta) ?? []),
        violation,
      ]),
    new Map<number, RhythmViolation[]>()
  );

const formatPosition = ({
  selector,
  edge,
  actual,
  nearest,
}: RhythmViolation): string =>
  `${selector} ${edge}: ${actual}px, nearest ${nearest}px`;

// Equal deltas are a pattern worth reading together, not proof of a shared cause.
const formatGroup = (
  delta: number,
  shown: readonly RhythmViolation[],
  total: number
): string[] =>
  total === 1
    ? [`  ${formatPosition(shown[0])} (delta ${delta}px)`]
    : [
        `  ${total} with delta ${delta}px:`,
        ...shown.map((violation) => `    ${formatPosition(violation)}`),
      ];

const formatFix = ({ selector, edge, delta }: RhythmViolation): string =>
  `Fix from the top: move ${selector} ${edge} by ${-delta}px, then rerun. Moving an edge shifts everything below it, so later deltas go stale.`;

const formatFailure = ({
  grid,
  violations,
}: Pick<RhythmReport, 'grid' | 'violations'>): string => {
  const groups = groupByDelta(violations);
  const shown = [...groups.values()].flat().slice(0, MAX_REPORTED_VIOLATIONS);
  const hiddenCount = violations.length - shown.length;

  return [
    `Expected elements on the ${grid.lineHeight}px grid starting at y=${roundPx(grid.origin)}px, found ${violations.length} off-grid:`,
    ...[...groupByDelta(shown)].flatMap(([delta, items]) =>
      formatGroup(delta, items, groups.get(delta)?.length ?? items.length)
    ),
    ...(hiddenCount > 0 ? [`  ...and ${hiddenCount} more`] : []),
    formatFix(violations[0]),
  ].join('\n');
};

/** The error a report deserves, or `null` when it can be trusted as a pass. */
export const toAssertionError = (
  report: RhythmReport
): RhythmAssertionError | null => {
  if (report.checked === 0) {
    return createError(
      'RhythmAssertionError',
      RhythmErrorCode.NOTHING_MEASURED,
      'Nothing was measured, so rhythm cannot be asserted. Check that root has rendered content and the environment has layout (jsdom does not).',
      { report }
    ) as RhythmAssertionError;
  }
  if (!report.ok) {
    return createError(
      'RhythmAssertionError',
      RhythmErrorCode.OFF_GRID,
      formatFailure(report),
      { report }
    ) as RhythmAssertionError;
  }
  return null;
};
