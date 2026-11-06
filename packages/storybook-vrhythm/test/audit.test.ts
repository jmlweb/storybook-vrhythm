import { auditRhythm, expectRhythm } from '../src/audit';
import { DIV_ID, STORY_ROOT_ATTRIBUTE } from '../src/constants';
import { injectStyle } from '../src/utils';

type Box = { top: number; height: number; width?: number };

const rect = ({ top, height, width = 100 }: Box) =>
  ({
    top,
    bottom: top + height,
    height,
    width,
    left: 0,
    right: width,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const place = <T extends Element>(element: T, box: Box): T => {
  element.getBoundingClientRect = () => rect(box);
  return element;
};

const add = (parent: Element, box: Box, tag = 'div'): HTMLElement =>
  parent.appendChild(place(document.createElement(tag), box));

const createRoot = (): HTMLElement =>
  add(document.body, { top: 0, height: 800 });

beforeEach(() => {
  document.body.replaceChildren();
});

afterEach(() => {
  document.documentElement.style.fontSize = '';
  Reflect.deleteProperty(document, 'fonts');
  Reflect.deleteProperty(Range.prototype, 'getClientRects');
});

describe('auditRhythm', () => {
  it('passes when every box edge is on the grid', async () => {
    const root = createRoot();
    add(root, { top: 8, height: 16 });

    const report = await auditRhythm(root, { lineHeight: '8px' });

    expect(report).toEqual({
      ok: true,
      grid: { lineHeight: 8, origin: 0 },
      checked: 2,
      violations: [],
    });
  });

  it('reports off-grid top and bottom edges', async () => {
    const root = createRoot();
    add(root, { top: 21, height: 19 }, 'h2').className = 'title';

    const { ok, violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(ok).toBe(false);
    expect(violations).toEqual([
      {
        selector: 'h2.title',
        edge: 'top',
        actual: 21,
        nearest: 24,
        delta: -3,
      },
    ]);
  });

  it('reads the grid size and origin from the overlay', async () => {
    const root = createRoot();
    injectStyle({ top: '4px' }, { vrhythmLineHeight: '12px' });
    place(document.getElementById(DIV_ID) as HTMLElement, {
      top: 4,
      height: 800,
    });
    add(root, { top: 16, height: 12 });

    const report = await auditRhythm(root);

    expect(report.grid).toEqual({ lineHeight: 12, origin: 4 });
    expect(report.ok).toBe(true);
  });

  it('uses the explicit offset from root instead of the overlay', async () => {
    const root = add(document.body, { top: 100, height: 800 });
    injectStyle({}, { vrhythmLineHeight: '8px' });
    place(document.getElementById(DIV_ID) as HTMLElement, {
      top: 0,
      height: 800,
    });

    const { grid } = await auditRhythm(root, { offset: '3px' });

    expect(grid.origin).toBe(103);
  });

  it('falls back to the top of root without an overlay', async () => {
    const root = add(document.body, { top: 100, height: 800 });

    const { grid } = await auditRhythm(root, { lineHeight: '8px' });

    expect(grid.origin).toBe(100);
  });

  it('resolves rem against the root font size', async () => {
    document.documentElement.style.fontSize = '20px';
    const root = createRoot();

    const { grid } = await auditRhythm(root, { lineHeight: '0.5rem' });

    expect(grid.lineHeight).toBe(10);
  });

  it.each(['1em', '8', 'auto', '0px', 0, -8, Number.NaN, Infinity])(
    'rejects the lineHeight %s',
    async (lineHeight) => {
      await expect(
        auditRhythm(createRoot(), { lineHeight })
      ).rejects.toMatchObject({ name: 'RhythmConfigError' });
    }
  );

  it.each([Number.NaN, Infinity, -Infinity])(
    'rejects the offset %s instead of passing',
    async (offset) => {
      const root = createRoot();
      add(root, { top: 21, height: 19 });

      await expect(
        expectRhythm(root, { lineHeight: 8, offset })
      ).rejects.toMatchObject({ name: 'RhythmConfigError' });
    }
  );

  it.each([Number.NaN, Infinity, -1])(
    'rejects the tolerance %s',
    async (tolerance) => {
      const root = createRoot();
      add(root, { top: 21, height: 19 });

      await expect(
        expectRhythm(root, { lineHeight: 8, tolerance })
      ).rejects.toMatchObject({ name: 'RhythmConfigError' });
    }
  );

  it.each([
    [4, 8],
    [5, 8],
    [0.5, 1],
  ])(
    'rejects the tolerance %s on a %spx grid, which no layout can fail',
    async (tolerance, lineHeight) => {
      const root = createRoot();
      add(root, { top: 21, height: 19 });

      await expect(
        expectRhythm(root, { lineHeight, tolerance })
      ).rejects.toMatchObject({ name: 'RhythmConfigError' });
    }
  );

  it('accepts a tolerance just under half the grid', async () => {
    const root = createRoot();
    add(root, { top: 4, height: 8 });

    const { ok } = await auditRhythm(root, { lineHeight: 8, tolerance: 3.99 });

    expect(ok).toBe(false);
  });

  it('rejects a box it cannot measure instead of passing', async () => {
    const root = createRoot();
    add(root, { top: Number.NaN, height: 8 });

    await expect(auditRhythm(root, { lineHeight: 8 })).rejects.toMatchObject({
      name: 'RhythmConfigError',
    });
  });

  it('names the overlay when its line height is unsupported', async () => {
    injectStyle({}, { vrhythmLineHeight: '1.5em' });

    await expect(auditRhythm(createRoot())).rejects.toThrow(
      'Unsupported lineHeight from the overlay "1.5em"'
    );
  });

  it('throws when no overlay or lineHeight gives a grid', async () => {
    await expect(auditRhythm(createRoot())).rejects.toThrow('No grid found');
  });

  it('honours the tolerance option', async () => {
    const root = createRoot();
    add(root, { top: 9, height: 15 });

    const report = await auditRhythm(root, { lineHeight: 8, tolerance: 1 });

    expect(report.ok).toBe(true);
  });

  it('skips data-vrhythm-ignore subtrees and the ignore option', async () => {
    const root = createRoot();
    const ignored = add(root, { top: 3, height: 3 });
    ignored.setAttribute('data-vrhythm-ignore', '');
    add(ignored, { top: 5, height: 5 });
    add(root, { top: 7, height: 7 }).className = 'badge';

    const report = await auditRhythm(root, {
      lineHeight: 8,
      ignore: '.badge',
    });

    expect(report.checked).toBe(0);
  });

  it('skips the overlay, inline, empty and hidden elements', async () => {
    const root = createRoot();
    add(root, { top: 3, height: 3 }).id = DIV_ID;
    add(root, { top: 3, height: 3 }, 'span');
    add(root, { top: 3, height: 3, width: 0 });
    add(root, { top: 3, height: 3 }).style.visibility = 'hidden';
    const removed = add(root, { top: 3, height: 3 });
    removed.style.display = 'none';
    add(removed, { top: 3, height: 3 });

    const report = await auditRhythm(root, { lineHeight: 8 });

    expect(report.checked).toBe(0);
  });

  it('measures inline images but not inline svg', async () => {
    const root = createRoot();
    add(root, { top: 3, height: 5 }, 'img');
    root.appendChild(
      place(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
        top: 3,
        height: 5,
      })
    );

    const { violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(violations.map(({ selector }) => selector)).toEqual(['img']);
  });

  it('uses the first safe class and escapes test ids', async () => {
    const root = createRoot();
    add(root, { top: 3, height: 5 }).className = 'md:flex card';
    add(root, { top: 3, height: 5 }).setAttribute('data-testid', 'a"b');

    const { violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(violations.map(({ selector }) => selector)).toEqual([
      'div.card:nth-of-type(1)',
      '[data-testid="a\\"b"]',
    ]);
  });

  it('still measures block children of inline elements', async () => {
    const root = createRoot();
    const span = add(root, { top: 3, height: 3 }, 'span');
    add(span, { top: 3, height: 5 });

    const { violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(violations).toHaveLength(1);
    expect(violations[0].selector).toBe('span > div');
  });

  it('reports an edge shared with a parent only on the parent', async () => {
    const root = createRoot();
    const wrapper = add(root, { top: 3, height: 13 });
    wrapper.className = 'wrapper';
    add(wrapper, { top: 3, height: 13 }).className = 'inner';

    const { violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(violations.map(({ selector }) => selector)).toEqual(['div.wrapper']);
  });

  it('reports every sibling that shares an off-grid edge', async () => {
    const root = createRoot();
    add(root, { top: 3, height: 13 });
    add(root, { top: 3, height: 13 });

    const { violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(violations.map(({ selector }) => selector)).toEqual([
      'div:nth-of-type(1)',
      'div:nth-of-type(2)',
    ]);
  });

  it('prefers test ids and ids, and skips unsafe ones', async () => {
    const root = createRoot();
    add(root, { top: 3, height: 5 }).setAttribute('data-testid', 'card');
    add(root, { top: 3, height: 5 }).id = 'hero';
    add(root, { top: 3, height: 5 }).id = ':r1:';

    const { violations } = await auditRhythm(root, { lineHeight: 8 });

    expect(violations.map(({ selector }) => selector)).toEqual([
      '[data-testid="card"]',
      '#hero',
      'div:nth-of-type(3)',
    ]);
  });

  describe('baseline check', () => {
    const textRects = (tops: number[]) => {
      // jsdom does not implement Range.getClientRects.
      const getClientRects = vi.fn(
        () =>
          tops.map((top) => rect({ top, height: 16 })) as unknown as DOMRectList
      );
      Range.prototype.getClientRects = getClientRects;
      return getClientRects;
    };

    const fakeCanvas = (ascent: number | undefined) => {
      const context = {
        font: '',
        measureText: () => ({ fontBoundingBoxAscent: ascent }),
      };
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        context as unknown as RenderingContext
      );
      return context;
    };

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('checks each line at rect top plus font ascent', async () => {
      textRects([4, 28]);
      fakeCanvas(12);
      const root = createRoot();
      add(root, { top: 0, height: 48 }, 'p').textContent = 'Two lines';

      const { checked, violations } = await auditRhythm(root, {
        lineHeight: 8,
        checks: ['baseline'],
      });

      expect(checked).toBe(2);
      expect(violations).toEqual([]);
    });

    it('measures with the font of the element', async () => {
      textRects([4]);
      const context = fakeCanvas(12);
      const root = createRoot();
      const text = add(root, { top: 0, height: 24 }, 'p');
      text.textContent = 'Text';
      Object.assign(text.style, {
        fontStyle: 'italic',
        fontWeight: '700',
        fontSize: '20px',
        fontFamily: 'Georgia',
      });

      await auditRhythm(root, { lineHeight: 8, checks: ['baseline'] });

      expect(context.font).toBe('italic 700 20px Georgia');
    });

    it('reports an off-grid baseline', async () => {
      textRects([5]);
      fakeCanvas(12);
      const root = createRoot();
      add(root, { top: 0, height: 24 }, 'p').textContent = 'Text';

      const { violations } = await auditRhythm(root, {
        lineHeight: 8,
        checks: ['baseline'],
      });

      expect(violations).toEqual([
        { selector: 'p', edge: 'baseline', actual: 17, nearest: 16, delta: 1 },
      ]);
    });

    it('rejects a baseline it cannot measure instead of passing', async () => {
      textRects([5]);
      fakeCanvas(undefined);
      const root = createRoot();
      add(root, { top: 0, height: 24 }, 'p').textContent = 'Text';

      await expect(
        expectRhythm(root, { lineHeight: 8, checks: ['baseline'] })
      ).rejects.toMatchObject({ name: 'RhythmConfigError' });
    });

    it('measures text placed directly in root', async () => {
      textRects([5]);
      fakeCanvas(12);
      const root = createRoot();
      root.textContent = 'Bare text';
      root.id = 'storybook-root';

      const { violations } = await auditRhythm(root, {
        lineHeight: 8,
        checks: ['baseline'],
      });

      expect(violations).toEqual([
        {
          selector: '#storybook-root',
          edge: 'baseline',
          actual: 17,
          nearest: 16,
          delta: 1,
        },
      ]);
    });

    it('collapses line fragments a fraction of a pixel apart', async () => {
      textRects([4.001, 4.002]);
      fakeCanvas(12);
      const root = createRoot();
      add(root, { top: 0, height: 24 }, 'p').textContent = 'Text';

      const { checked } = await auditRhythm(root, {
        lineHeight: 8,
        checks: ['baseline'],
      });

      expect(checked).toBe(1);
    });

    it('measures text inside inline elements', async () => {
      textRects([5]);
      fakeCanvas(12);
      const root = createRoot();
      add(root, { top: 0, height: 24 }, 'span').textContent = 'Text';

      const { checked } = await auditRhythm(root, {
        lineHeight: 8,
        checks: ['baseline'],
      });

      expect(checked).toBe(1);
    });

    it('ignores whitespace-only text', async () => {
      const rects = textRects([5]);
      fakeCanvas(12);
      const root = createRoot();
      add(root, { top: 0, height: 24 }, 'p').textContent = '  \n ';

      const { checked } = await auditRhythm(root, {
        lineHeight: 8,
        checks: ['baseline'],
      });

      expect(checked).toBe(0);
      expect(rects).not.toHaveBeenCalled();
    });

    it('throws without a canvas context', async () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

      await expect(
        auditRhythm(createRoot(), { lineHeight: 8, checks: ['baseline'] })
      ).rejects.toThrow('canvas 2D');
    });
  });

  it('waits for web fonts before measuring', async () => {
    const root = createRoot();
    const box = add(root, { top: 3, height: 5 });
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: Promise.resolve().then(() => {
          place(box, { top: 8, height: 8 });
        }),
      },
    });

    const report = await auditRhythm(root, { lineHeight: 8 });

    expect(report.ok).toBe(true);
  });
});

describe('expectRhythm', () => {
  it('resolves when elements are on the grid', async () => {
    const root = createRoot();
    add(root, { top: 8, height: 8 });

    await expect(
      expectRhythm(root, { lineHeight: 8 })
    ).resolves.toBeUndefined();
  });

  it('throws with the violations in the message and report', async () => {
    const root = createRoot();
    add(root, { top: 21, height: 19 }, 'h2');

    await expect(
      expectRhythm(root, { lineHeight: 8, offset: 2 })
    ).rejects.toThrow('8px grid starting at y=2px');

    await expect(expectRhythm(root, { lineHeight: 8 })).rejects.toMatchObject({
      name: 'RhythmAssertionError',
      message: expect.stringContaining(
        'h2 top: 21px, nearest 24px (delta -3px)'
      ),
      report: { ok: false, violations: [expect.anything()] },
    });
  });

  it('truncates long failure messages but keeps the full report', async () => {
    const root = createRoot();
    Array.from({ length: 12 }).forEach((_, index) => {
      add(root, { top: 3 + index * 8, height: 8 });
    });

    const error = await expectRhythm(root, { lineHeight: 8 }).catch(
      (caught: Error & { report: { violations: unknown[] } }) => caught
    );

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('found 24 off-grid');
    expect((error as Error).message).toContain('...and 14 more');
    expect(
      (error as { report: { violations: unknown[] } }).report.violations
    ).toHaveLength(24);
  });

  it('fails instead of passing when nothing was measured', async () => {
    await expect(expectRhythm(createRoot(), { lineHeight: 8 })).rejects.toThrow(
      'Nothing was measured'
    );
  });
});

describe('overlay checks', () => {
  const overlayAt = (box: Box, dataset: Record<string, string> = {}) => {
    injectStyle({}, { vrhythmLineHeight: '8px', ...dataset });
    return place(document.getElementById(DIV_ID) as HTMLElement, box);
  };

  const codeOf = (promise: Promise<unknown>) =>
    promise.then(
      () => null,
      (error: { code: string }) => error.code
    );

  it('rejects a zero-height overlay', async () => {
    const root = createRoot();
    overlayAt({ top: 700, height: 0 });

    expect(await codeOf(auditRhythm(root))).toBe('UNUSABLE_OVERLAY');
  });

  it('rejects a zero-width overlay', async () => {
    const root = createRoot();
    overlayAt({ top: 0, height: 800, width: 0 });

    expect(await codeOf(auditRhythm(root))).toBe('UNUSABLE_OVERLAY');
  });

  it('rejects an overlay outside the canvas', async () => {
    const root = createRoot();
    overlayAt({ top: 900, height: 100 });

    expect(await codeOf(auditRhythm(root))).toBe('UNUSABLE_OVERLAY');
  });

  it('accepts a bad overlay when offset replaces it', async () => {
    const root = createRoot();
    add(root, { top: 8, height: 16 });
    overlayAt({ top: 700, height: 0 });

    const { ok } = await auditRhythm(root, { offset: 0 });
    expect(ok).toBe(true);
  });

  it('leaves an empty root to the checked count', async () => {
    const root = add(document.body, { top: 0, height: 0 });
    overlayAt({ top: 0, height: 0 });

    expect((await auditRhythm(root)).checked).toBe(0);
  });

  it('rejects a grid from an unknown preset', async () => {
    const root = createRoot();
    overlayAt({ top: 0, height: 800 }, { vrhythmUnknownPreset: 'nope' });

    expect(await codeOf(auditRhythm(root))).toBe('UNKNOWN_PRESET');
    await expect(auditRhythm(root, { lineHeight: 8 })).resolves.toBeDefined();
  });

  it('names an anchor that matches nothing', async () => {
    const root = createRoot();
    overlayAt({ top: 0, height: 800 }, { vrhythmAnchor: '#gone' });

    await expect(auditRhythm(root)).rejects.toThrow('"#gone"');
    expect(await codeOf(auditRhythm(root))).toBe('ANCHOR_NOT_FOUND');
  });
});

describe('anchor option', () => {
  const originOf = async (root: Element, anchor: string, offset?: number) =>
    (await auditRhythm(root, { lineHeight: 8, anchor, offset })).grid.origin;

  it('measures from the page', async () => {
    const root = add(document.body, { top: 100, height: 800 });

    expect(await originOf(root, 'page', 4)).toBe(4);
  });

  it('measures from the story root', async () => {
    const story = add(document.body, { top: 100, height: 800 });
    story.setAttribute(STORY_ROOT_ATTRIBUTE, '');
    const inner = add(story, { top: 140, height: 80 });

    expect(await originOf(inner, 'story')).toBe(100);
  });

  it('measures from a selector, and rejects one that matches nothing', async () => {
    const root = createRoot();
    add(root, { top: 40, height: 80 }).id = 'target';

    expect(await originOf(root, '#target')).toBe(40);
    await expect(originOf(root, '#gone')).rejects.toMatchObject({
      code: 'ANCHOR_NOT_FOUND',
    });
  });

  it('ignores an overlay with a broken anchor', async () => {
    const root = createRoot();
    injectStyle({}, { vrhythmLineHeight: '8px', vrhythmAnchor: '#gone' });

    const { ok } = await auditRhythm(root, { offset: 0 });
    expect(ok).toBe(true);
  });
});

describe('edges', () => {
  it('measures only the named edges and counts what it measured', async () => {
    const root = createRoot();
    add(root, { top: 8, height: 11 });

    const report = await auditRhythm(root, {
      lineHeight: 8,
      edges: ['top'],
    });

    expect(report).toMatchObject({ ok: true, checked: 1 });
  });

  it('rejects an empty list', async () => {
    await expect(
      auditRhythm(createRoot(), { lineHeight: 8, edges: [] })
    ).rejects.toMatchObject({ code: 'INVALID_EDGES' });
  });
});

describe('failure message', () => {
  const failure = (root: Element) =>
    expectRhythm(root, { lineHeight: 8 }).catch((error: Error) => error);

  it('groups equal deltas that are not adjacent', async () => {
    const root = createRoot();
    add(root, { top: 7, height: 9 }).className = 'a';
    add(root, { top: 26, height: 6 }).className = 'b';
    add(root, { top: 47, height: 9 }).className = 'c';

    const { message, code } = (await failure(root)) as Error & { code: string };

    expect(code).toBe('OFF_GRID');
    expect(message).toContain('2 with delta -1px:');
    expect(message).toContain('div.a:nth-of-type(1) top: 7px, nearest 8px');
    expect(message).toContain('div.c:nth-of-type(3) top: 47px, nearest 48px');
    expect(message).toContain('(delta 2px)');
  });

  it('tells the reader how to fix the first violation', async () => {
    const root = createRoot();
    add(root, { top: 21, height: 19 }, 'h2').className = 'title';

    const { message } = (await failure(root)) as Error;

    expect(message).toContain('move h2.title top by 3px');
  });

  it('keeps every violation in the report when grouping', async () => {
    const root = createRoot();
    for (const top of [7, 15, 23]) {
      add(root, { top, height: 9 });
    }

    const { report } = (await failure(root)) as Error & {
      report: { violations: unknown[] };
    };

    expect(report.violations).toHaveLength(3);
  });
});
