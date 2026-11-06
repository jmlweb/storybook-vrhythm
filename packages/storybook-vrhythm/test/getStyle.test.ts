import { getStyle } from '../src/getStyle';

describe('getStyle', () => {
  it('draws a numeric lineHeight in px', () => {
    expect(getStyle({ lineHeight: 8 }).background).toContain('/ 1px 8px');
  });

  it('gives a unitless zero a unit', () => {
    expect(getStyle({ offset: '0' }).top).toBe('0px');
  });

  it('treats every numeric length as px', () => {
    const style = getStyle({
      offset: 4,
      lineWidth: 2,
      maxWidth: 1200,
      columnWidth: 80,
      gutterWidth: 16,
    });

    expect(style.top).toBe('4px');
    expect(style.width).toBe('1200px');
    expect(style.background).toBe(
      'linear-gradient(rgb(204, 204, 204) 2px, transparent 2px) left top / 2px 16px, linear-gradient(90deg, transparent calc(80px - 16px), rgb(204, 204, 204) calc(80px - 16px)) left top / 80px 100%'
    );
  });

  it('works with default values', () => {
    const style = getStyle({});
    expect(style.top).toBe('0px');
    expect(style.background).toBe(
      'linear-gradient(rgb(204, 204, 204) 1px, transparent 1px) left top / 1px 16px'
    );
    expect(style.opacity).toBe(1);
    expect(style.zIndex).toBe(9999);
  });

  it('works with custom values', () => {
    const style = getStyle({
      color: '#ff0000',
      offset: '20px',
      lineHeight: '8px',
    });
    expect(style.top).toBe('20px');
    expect(style.background).toBe(
      'linear-gradient(#ff0000 1px, transparent 1px) left top / 1px 8px'
    );
  });

  it('applies custom opacity and zIndex', () => {
    const style = getStyle({ opacity: 0.5, zIndex: 100 });
    expect(style.opacity).toBe(0.5);
    expect(style.zIndex).toBe(100);
  });

  it('adds column grid when columnWidth is set', () => {
    const style = getStyle({ columnWidth: '80px' });
    expect(style.background).toContain('90deg');
    expect(style.background).toContain('80px');
    expect(style.background).toContain('100%');
  });

  it('uses columnColor for columns when provided', () => {
    const style = getStyle({
      columnWidth: '80px',
      columnColor: 'red',
    });
    expect(style.background).toContain('90deg, red');
  });

  it('falls back to color for columns when columnColor is not set', () => {
    const style = getStyle({ color: 'blue', columnWidth: '80px' });
    expect(style.background).toContain('90deg, blue');
  });

  it('does not include column gradient when columnWidth is not set', () => {
    const style = getStyle({});
    expect(style.background).not.toContain('90deg');
  });

  it('uses custom lineWidth', () => {
    const style = getStyle({ lineWidth: '2px' });
    expect(style.background).toContain('2px');
  });

  it('applies lineWidth to column lines', () => {
    const style = getStyle({ columnWidth: '80px', lineWidth: '2px' });
    expect(style.background).toContain('90deg');
    expect(style.background).toContain('2px');
  });

  it('centers overlay when maxWidth is set', () => {
    const style = getStyle({ maxWidth: '1200px' });
    expect(style.left).toBe('50%');
    expect(style.width).toBe('1200px');
    expect(style.transform).toBe('translateX(-50%)');
    expect(style.right).toBeUndefined();
  });

  it('uses left/right when maxWidth is not set', () => {
    const style = getStyle({});
    expect(style.left).toBe(0);
    expect(style.right).toBe(0);
    expect(style.transform).toBeUndefined();
  });

  it('shows gutter band when gutterWidth is set with columnWidth', () => {
    const style = getStyle({ columnWidth: '80px', gutterWidth: '16px' });
    expect(style.background).toContain('transparent calc(80px - 16px)');
  });

  it('uses line style for columns when gutterWidth is not set', () => {
    const style = getStyle({ columnWidth: '80px' });
    expect(style.background).not.toContain('transparent calc');
  });
});
