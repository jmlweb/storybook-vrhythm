import { findViolations } from '../src/find-violations';

const grid = { lineHeight: 8, origin: 0 };
const measure = (y: number) => ({
  describe: () => 'div',
  edge: 'top' as const,
  y,
});

describe('findViolations', () => {
  it('returns nothing for positions on the grid', () => {
    expect(findViolations([measure(0), measure(24)], grid, 0.5)).toEqual([]);
  });

  it('reports position, nearest line and signed delta', () => {
    expect(findViolations([measure(21)], grid, 0.5)).toEqual([
      { selector: 'div', edge: 'top', actual: 21, nearest: 24, delta: -3 },
    ]);
    expect(findViolations([measure(26)], grid, 0.5)[0]).toMatchObject({
      nearest: 24,
      delta: 2,
    });
  });

  it('measures relative to the grid origin', () => {
    expect(
      findViolations([measure(21)], { lineHeight: 8, origin: 5 }, 0.5)
    ).toEqual([]);
    expect(
      findViolations([measure(24)], { lineHeight: 8, origin: 5 }, 0.5)[0]
    ).toMatchObject({ actual: 19, nearest: 16, delta: 3 });
  });

  it('allows positions within the tolerance, inclusive', () => {
    expect(findViolations([measure(24.5)], grid, 0.5)).toEqual([]);
    expect(findViolations([measure(24.51)], grid, 0.5)).toHaveLength(1);
  });

  it('handles positions above the origin without negative zero', () => {
    expect(findViolations([measure(-2)], grid, 0.5)).toEqual([
      { selector: 'div', edge: 'top', actual: -2, nearest: 0, delta: -2 },
    ]);
    expect(
      Object.is(findViolations([measure(-2)], grid, 0.5)[0].nearest, 0)
    ).toBe(true);
  });

  it('rounds reported values to two decimals', () => {
    expect(findViolations([measure(3.33333)], grid, 0.5)[0]).toMatchObject({
      actual: 3.33,
      delta: 3.33,
    });
  });
});
