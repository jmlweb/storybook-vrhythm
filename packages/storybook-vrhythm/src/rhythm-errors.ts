import type { RhythmGrid, RhythmViolation } from './find-violations';
import { roundPx } from './find-violations';

/** Stable identifiers for audit errors. Branch on these, not on messages. */
export const RhythmErrorCode = {
  NO_GRID: 'NO_GRID',
  INVALID_LENGTH: 'INVALID_LENGTH',
  INVALID_TOLERANCE: 'INVALID_TOLERANCE',
  INVALID_EDGES: 'INVALID_EDGES',
  UNKNOWN_PRESET: 'UNKNOWN_PRESET',
  ANCHOR_NOT_FOUND: 'ANCHOR_NOT_FOUND',
  UNUSABLE_OVERLAY: 'UNUSABLE_OVERLAY',
  UNMEASURABLE: 'UNMEASURABLE',
  NOTHING_MEASURED: 'NOTHING_MEASURED',
  OFF_GRID: 'OFF_GRID',
} as const;

export type RhythmErrorCode =
  (typeof RhythmErrorCode)[keyof typeof RhythmErrorCode];

interface FailureReport {
  grid: RhythmGrid;
  violations: RhythmViolation[];
}

export type RhythmConfigError = Error & { code: RhythmErrorCode };

export type RhythmAssertionError<Report = FailureReport> = Error & {
  code: RhythmErrorCode;
  report: Report;
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

export const formatFailure = ({ grid, violations }: FailureReport): string => {
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
