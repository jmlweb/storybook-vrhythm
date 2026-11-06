import { vi } from 'vitest';
import { DEFAULT_COLOR, DEFAULT_LINE_HEIGHT, DIV_ID } from '../src/constants';
import vrhythm, { withVRhythm } from '../src/index';
import { type PresetAliasName, presetAliases, presets } from '../src/presets';
import { injectStyle, removeElement } from '../src/utils';

vi.mock('../src/utils', () => ({
  injectStyle: vi.fn(),
  removeElement: vi.fn(),
}));

const mockInjectStyle = vi.mocked(injectStyle);
const mockRemoveElement = vi.mocked(removeElement);

type Context = Parameters<typeof withVRhythm>[1];

beforeEach(() => {
  mockInjectStyle.mockClear();
  mockRemoveElement.mockClear();
});

describe('withVRhythm', () => {
  it('calls storyFn and returns its result', () => {
    const storyFn = vi.fn().mockReturnValue('story-result');
    const context = {} as Context;

    const result = withVRhythm(storyFn, context);

    expect(storyFn).toHaveBeenCalledWith(context);
    expect(result).toBe('story-result');
  });

  it('calls injectStyle when not hidden', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {} as Context);

    expect(mockInjectStyle).toHaveBeenCalledTimes(1);
    expect(mockRemoveElement).not.toHaveBeenCalled();
  });

  it('publishes the default line height for the audit', () => {
    withVRhythm(vi.fn(), {} as Context);

    expect(mockInjectStyle.mock.calls[0][2]).toEqual({
      vrhythmLineHeight: '16px',
    });
  });

  it('falls back to the default when lineHeight is explicitly undefined', () => {
    withVRhythm(vi.fn(), {
      parameters: { vrhythm: { lineHeight: undefined } },
    } as Context);

    expect(mockInjectStyle.mock.calls[0][2]).toEqual({
      vrhythmLineHeight: DEFAULT_LINE_HEIGHT,
    });
  });

  it('publishes a numeric line height in px', () => {
    withVRhythm(vi.fn(), {
      parameters: { vrhythm: { lineHeight: 8 } },
    } as Context);

    expect(mockInjectStyle.mock.calls[0][2]).toEqual({
      vrhythmLineHeight: '8px',
    });
  });

  it('publishes the final line height for the audit', () => {
    withVRhythm(vi.fn(), {
      parameters: { vrhythm: { lineHeight: '24px' } },
      globals: { vrhythm: 'material' },
    } as Context);

    expect(mockInjectStyle.mock.calls[0][2]).toEqual({
      vrhythmLineHeight: '4px',
    });
  });

  it('uses default parameters when none are provided', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {} as Context);

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain(DEFAULT_COLOR);
    expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
  });

  it('uses custom parameters when provided', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {
      parameters: {
        vrhythm: { color: '#ff0000', lineHeight: '24px' },
      },
    } as Context);

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain('#ff0000');
    expect(style.background).toContain('24px');
  });

  it('calls removeElement when hide is true', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {
      parameters: { vrhythm: { hide: true } },
    } as Context);

    expect(mockRemoveElement).toHaveBeenCalledTimes(1);
    expect(mockInjectStyle).not.toHaveBeenCalled();
  });

  it('merges partial parameters with defaults', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {
      parameters: {
        vrhythm: { color: '#abc123' },
      },
    } as Context);

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain('#abc123');
    expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
  });

  it('does not throw when hide is true and element is not in DOM', () => {
    const storyFn = vi.fn();
    expect(() =>
      withVRhythm(storyFn, {
        parameters: { vrhythm: { hide: true } },
      } as Context)
    ).not.toThrow();
  });

  describe('presets', () => {
    it('applies preset styles when preset name is valid', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: { vrhythm: { preset: 'material' } },
      } as Context);

      const style = mockInjectStyle.mock.calls[0][0];
      expect(style.background).toContain('4px');
    });

    it.each(Object.entries(presetAliases))(
      'alias %s resolves to the %s preset',
      (alias, base) => {
        expect(presets[alias as PresetAliasName]).toBe(
          presets[base as keyof typeof presets]
        );
      }
    );

    it('ignores invalid preset names', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: { vrhythm: { preset: 'nonexistent' } },
      } as Context);

      const style = mockInjectStyle.mock.calls[0][0];
      expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
    });

    it('allows custom props to override preset values', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: {
          vrhythm: { preset: 'material', color: '#000' },
        },
      } as Context);

      const style = mockInjectStyle.mock.calls[0][0];
      expect(style.background).toContain('#000');
      expect(style.background).toContain('4px');
    });
  });

  describe('toolbar toggle (globals)', () => {
    it('hides when globals.vrhythm is false', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        globals: { vrhythm: false },
      } as Context);

      expect(mockRemoveElement).toHaveBeenCalledTimes(1);
      expect(mockInjectStyle).not.toHaveBeenCalled();
    });

    it('shows when globals.vrhythm is true', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        globals: { vrhythm: true },
      } as Context);

      expect(mockInjectStyle).toHaveBeenCalledTimes(1);
      expect(mockRemoveElement).not.toHaveBeenCalled();
    });

    it('parameters.hide takes precedence over globals.vrhythm', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: { vrhythm: { hide: true } },
        globals: { vrhythm: true },
      } as Context);

      expect(mockRemoveElement).toHaveBeenCalledTimes(1);
      expect(mockInjectStyle).not.toHaveBeenCalled();
    });

    it('falls back to parameters.hide when globals.vrhythm is undefined', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: { vrhythm: { hide: true } },
        globals: {},
      } as Context);

      expect(mockRemoveElement).toHaveBeenCalledTimes(1);
      expect(mockInjectStyle).not.toHaveBeenCalled();
    });
  });

  describe('toolbar global preset selection', () => {
    it('applies global preset when globals.vrhythm is a valid preset name', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        globals: { vrhythm: 'material' },
      } as Context);

      const style = mockInjectStyle.mock.calls[0][0];
      expect(style.background).toContain('4px'); // material lineHeight
    });

    it('global preset overrides story parameters style', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: { vrhythm: { lineHeight: '24px' } },
        globals: { vrhythm: 'material' },
      } as Context);

      const style = mockInjectStyle.mock.calls[0][0];
      expect(style.background).toContain('4px'); // material overrides 24px
    });

    it('does not apply global preset for unknown preset name', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        globals: { vrhythm: 'nonexistent' },
      } as Context);

      expect(mockInjectStyle).toHaveBeenCalledTimes(1);
      const style = mockInjectStyle.mock.calls[0][0];
      expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
    });

    it('global preset does not affect hide behavior from parameters', () => {
      const storyFn = vi.fn();
      withVRhythm(storyFn, {
        parameters: { vrhythm: { hide: true } },
        globals: { vrhythm: 'material' },
      } as Context);

      expect(mockRemoveElement).toHaveBeenCalledTimes(1);
      expect(mockInjectStyle).not.toHaveBeenCalled();
    });
  });
});

describe('default export', () => {
  it('returns the preview annotations for CSF Next', () => {
    const addon = vrhythm();

    expect(addon.decorators).toEqual([withVRhythm]);
    expect(
      addon.globalTypes?.vrhythm.toolbar.items.map(
        (item: { value: string }) => item.value
      )
    ).toEqual([
      'true',
      'false',
      '4px',
      '8px',
      '12px',
      '16px',
      '24px',
      '32px',
      'material',
      'tailwind',
      'bootstrap',
      'carbon',
    ]);
    expect(addon.initialGlobals).toEqual({ vrhythm: 'true' });
  });
});

describe('double application', () => {
  it('leaves exactly one overlay element', async () => {
    const { injectStyle: actualInjectStyle, removeElement: actualRemove } =
      await vi.importActual<typeof import('../src/utils')>('../src/utils');
    mockInjectStyle
      .mockImplementationOnce(actualInjectStyle)
      .mockImplementationOnce(actualInjectStyle);
    const context = {} as Context;

    withVRhythm(() => withVRhythm(vi.fn(), context), context);

    expect(document.querySelectorAll(`#${DIV_ID}`)).toHaveLength(1);
    actualRemove();
  });
});
