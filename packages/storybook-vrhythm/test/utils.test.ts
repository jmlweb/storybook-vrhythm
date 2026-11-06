import { DIV_ID, STORY_ROOT_ATTRIBUTE } from '../src/constants';
import {
  injectStyle,
  isAnchorMissing,
  keepOverlayInSync,
  removeElement,
  resolveAnchor,
  syncOverlay,
} from '../src/utils';

beforeEach(() => {
  const existing = document.getElementById(DIV_ID);
  if (existing) {
    existing.remove();
  }
});

describe('injectStyle', () => {
  it('creates an element with the correct id', () => {
    injectStyle({ color: 'red' });
    const el = document.getElementById(DIV_ID);
    expect(el).not.toBeNull();
  });

  it('writes the given dataset to the element', () => {
    injectStyle({}, { vrhythmLineHeight: '8px' });
    const el = document.getElementById(DIV_ID);
    expect(el?.getAttribute('data-vrhythm-line-height')).toBe('8px');
  });

  it('applies the given styles to the element', () => {
    injectStyle({ position: 'absolute', top: 0 });
    const el = document.getElementById(DIV_ID) as HTMLDivElement;
    expect(el.style.position).toBe('absolute');
  });

  it('appends the element to the body', () => {
    injectStyle({ color: 'blue' });
    const el = document.getElementById(DIV_ID);
    expect(el?.parentNode).toBe(document.body);
  });

  it('does not re-append element if it already exists in the DOM', () => {
    injectStyle({ color: 'red' });
    injectStyle({ color: 'blue' });

    const elements = document.querySelectorAll(`#${DIV_ID}`);
    expect(elements.length).toBe(1);
  });

  it('updates styles on an existing element', () => {
    injectStyle({ position: 'absolute' });
    injectStyle({ position: 'fixed' });

    const el = document.getElementById(DIV_ID) as HTMLDivElement;
    expect(el.style.position).toBe('fixed');
  });
});

describe('reused overlay', () => {
  it('drops styles the new story does not set', () => {
    injectStyle({ left: '50%', width: '400px', transform: 'translateX(-50%)' });
    injectStyle({ left: 0, right: 0 });

    const { style } = document.getElementById(DIV_ID) as HTMLDivElement;
    expect(style.transform).toBe('');
    expect(style.width).toBe('');
  });

  it('drops data the new story does not set', () => {
    injectStyle({}, { vrhythmUnknownPreset: 'nope' });
    injectStyle({}, { vrhythmLineHeight: '8px' });

    const { dataset } = document.getElementById(DIV_ID) as HTMLDivElement;
    expect(dataset.vrhythmUnknownPreset).toBeUndefined();
  });
});

describe('resolveAnchor', () => {
  const overlayWith = (anchor?: string): HTMLElement => {
    injectStyle({}, anchor ? { vrhythmAnchor: anchor } : {});
    return document.getElementById(DIV_ID) as HTMLElement;
  };

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('is the page without an anchor', () => {
    expect(resolveAnchor(overlayWith())).toBeNull();
  });

  it('is the marked story root, for a root inside the story', () => {
    const story = document.body.appendChild(document.createElement('div'));
    story.setAttribute(STORY_ROOT_ATTRIBUTE, '');
    const inner = story.appendChild(document.createElement('div'));

    expect(resolveAnchor(overlayWith('story'), inner)).toBe(story);
  });

  it('finds a selector, and flags one that matches nothing', () => {
    const target = document.body.appendChild(document.createElement('div'));
    target.id = 'target';

    expect(resolveAnchor(overlayWith('#target'))).toBe(target);

    const overlay = overlayWith('[unclosed');
    expect(resolveAnchor(overlay)).toBeNull();
    expect(isAnchorMissing(overlay, null)).toBe(true);
  });

  it('does not flag the page as missing', () => {
    expect(isAnchorMissing(overlayWith('page'), null)).toBe(false);
  });
});

describe('syncOverlay', () => {
  it('starts at the anchor and adds the offset', () => {
    injectStyle({}, { vrhythmOffset: '4px' });
    const overlay = document.getElementById(DIV_ID) as HTMLElement;
    const anchor = document.createElement('div');
    anchor.getBoundingClientRect = () => ({ top: 100 }) as DOMRect;

    syncOverlay(overlay, anchor);

    expect(overlay.style.top).toBe('calc(104px)');
    expect(overlay.style.bottom).toBe('auto');
  });
});

describe('keepOverlayInSync', () => {
  const disconnect = vi.fn();

  beforeEach(() => {
    disconnect.mockClear();
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function ResizeObserverStub() {
        return { observe: vi.fn(), disconnect };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('marks the story root', () => {
    const story = document.createElement('div');
    keepOverlayInSync(story);

    expect(story.hasAttribute(STORY_ROOT_ATTRIBUTE)).toBe(true);
    removeElement();
  });

  it('stops watching when replaced or removed', () => {
    keepOverlayInSync();
    keepOverlayInSync();
    expect(disconnect).toHaveBeenCalledTimes(1);

    removeElement();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('works without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    expect(() => keepOverlayInSync()).not.toThrow();
  });
});

describe('removeElement', () => {
  it('removes the element from the DOM', () => {
    injectStyle({ color: 'red' });
    expect(document.getElementById(DIV_ID)).not.toBeNull();

    removeElement();
    expect(document.getElementById(DIV_ID)).toBeNull();
  });

  it('does not throw if element does not exist', () => {
    expect(() => removeElement()).not.toThrow();
  });
});
