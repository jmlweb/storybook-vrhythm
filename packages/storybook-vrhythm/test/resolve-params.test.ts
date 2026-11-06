import { resolveParams } from '../src/resolve-params';

describe('resolveParams anchor', () => {
  it('uses container as a selector when anchor is not set', () => {
    const { anchor } = resolveParams({
      parameters: { vrhythm: { container: '#legacy' } },
    });

    expect(anchor).toBe('#legacy');
  });

  it('prefers anchor over container', () => {
    const { anchor } = resolveParams({
      parameters: { vrhythm: { anchor: 'page', container: '#legacy' } },
    });

    expect(anchor).toBe('page');
  });
});
