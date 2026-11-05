export type RhythmEdge = 'top' | 'bottom' | 'baseline';

export interface RhythmGrid {
  /** Distance between grid lines, in pixels. */
  lineHeight: number;
  /** Viewport Y coordinate of the first grid line, in pixels. */
  origin: number;
}

export interface RhythmMeasurement {
  selector: string;
  edge: RhythmEdge;
  /** Viewport Y coordinate, in pixels. */
  y: number;
}

export interface RhythmViolation {
  selector: string;
  edge: RhythmEdge;
  /** Position relative to the grid origin, in pixels. */
  actual: number;
  /** Closest grid line, relative to the grid origin, in pixels. */
  nearest: number;
  /** `actual - nearest`. Subtract it from the position to land on the grid. */
  delta: number;
}

// `+ 0` turns the -0 from rounding small negatives into 0, so results compare and serialize cleanly.
export const roundPx = (value: number): number =>
  Math.round(value * 100) / 100 + 0;

export const findViolations = (
  measurements: readonly RhythmMeasurement[],
  { lineHeight, origin }: RhythmGrid,
  tolerance: number
): RhythmViolation[] =>
  measurements.flatMap(({ selector, edge, y }) => {
    const actual = y - origin;
    const nearest = Math.round(actual / lineHeight) * lineHeight;
    const delta = actual - nearest;

    return Math.abs(delta) > tolerance
      ? [
          {
            selector,
            edge,
            actual: roundPx(actual),
            nearest: roundPx(nearest),
            delta: roundPx(delta),
          },
        ]
      : [];
  });
