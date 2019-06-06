import getStyle from '../src/getStyle';

describe('getStyle', () => {
  it('works with default values', () => {
    const style = getStyle({});
    expect(style.top).toBe(0);
    expect(style.background).toBe(
      'linear-gradient(rgb(204, 204, 204) 1px, transparent 1px) left top / 1px 16px'
    );
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
});
