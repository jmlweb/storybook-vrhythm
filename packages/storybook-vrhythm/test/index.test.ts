import { DEFAULT_COLOR, DEFAULT_LINE_HEIGHT } from '../src/constants';
import { withVRhythm } from '../src/index';
import { injectStyle, removeElement } from '../src/utils';
import { vi } from 'vitest';

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
});
