import { injectStyle, removeElement } from '../src/utils';
import { DIV_ID } from '../src/constants';

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

  it('appends the element to a custom container when specified', () => {
    const container = document.createElement('div');
    container.id = 'custom-root';
    document.body.appendChild(container);

    injectStyle({ color: 'green' }, '#custom-root');
    const el = document.getElementById(DIV_ID);
    expect(el?.parentNode).toBe(container);

    container.remove();
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
