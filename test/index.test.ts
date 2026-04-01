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

beforeEach(() => {
  mockInjectStyle.mockClear();
  mockRemoveElement.mockClear();
});

describe('withVRhythm', () => {
  it('calls storyFn and returns its result', () => {
    const storyFn = vi.fn().mockReturnValue('story-result');
    const context = {} as Parameters<typeof withVRhythm>[1];

    const result = withVRhythm(storyFn, context);

    expect(storyFn).toHaveBeenCalledWith(context);
    expect(result).toBe('story-result');
  });

  it('calls injectStyle when not hidden', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {} as Parameters<typeof withVRhythm>[1]);

    expect(mockInjectStyle).toHaveBeenCalledTimes(1);
    expect(mockRemoveElement).not.toHaveBeenCalled();
  });

  it('uses default parameters when none are provided', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {} as Parameters<typeof withVRhythm>[1]);

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
    } as Parameters<typeof withVRhythm>[1]);

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain('#ff0000');
    expect(style.background).toContain('24px');
  });

  it('calls removeElement when hide is true', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {
      parameters: { vrhythm: { hide: true } },
    } as Parameters<typeof withVRhythm>[1]);

    expect(mockRemoveElement).toHaveBeenCalledTimes(1);
    expect(mockInjectStyle).not.toHaveBeenCalled();
  });

  it('merges partial parameters with defaults', () => {
    const storyFn = vi.fn();
    withVRhythm(storyFn, {
      parameters: {
        vrhythm: { color: '#abc123' },
      },
    } as Parameters<typeof withVRhythm>[1]);

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain('#abc123');
    expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
  });

  it('does not throw when hide is true and element is not in DOM', () => {
    const storyFn = vi.fn();
    expect(() =>
      withVRhythm(storyFn, {
        parameters: { vrhythm: { hide: true } },
      } as Parameters<typeof withVRhythm>[1])
    ).not.toThrow();
  });
});
