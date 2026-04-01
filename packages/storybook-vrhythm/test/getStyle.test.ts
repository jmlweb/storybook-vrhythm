import { getStyle } from '../src/getStyle';

describe('getStyle', () => {
  it('works with default values', () => {
    const style = getStyle({});
    expect(style.top).toBe(0);
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
});
