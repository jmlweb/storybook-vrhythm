import { DEFAULT_COLOR, DEFAULT_LINE_HEIGHT } from '../src/constants';

jest.mock('../src/utils', () => ({
  injectStyle: jest.fn(),
  removeElement: jest.fn(),
}));

// Import after mock is set up
import { withVRhythm } from '../src/index';
import { injectStyle, removeElement } from '../src/utils';

const mockInjectStyle = injectStyle as jest.Mock;
const mockRemoveElement = removeElement as jest.Mock;

beforeEach(() => {
  mockInjectStyle.mockClear();
  mockRemoveElement.mockClear();
});

describe('withVRhythm', () => {
  it('calls storyFn and returns its result', () => {
    const storyFn = jest.fn().mockReturnValue('story-result');
    const context = {};

    const result = withVRhythm(storyFn, context);

    expect(storyFn).toHaveBeenCalledWith(context);
    expect(result).toBe('story-result');
  });

  it('calls injectStyle when not hidden', () => {
    const storyFn = jest.fn();
    withVRhythm(storyFn, {});

    expect(mockInjectStyle).toHaveBeenCalledTimes(1);
    expect(mockRemoveElement).not.toHaveBeenCalled();
  });

  it('uses default parameters when none are provided', () => {
    const storyFn = jest.fn();
    withVRhythm(storyFn, {});

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain(DEFAULT_COLOR);
    expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
  });

  it('uses custom parameters when provided', () => {
    const storyFn = jest.fn();
    withVRhythm(storyFn, {
      parameters: {
        vrhythm: { color: '#ff0000', lineHeight: '24px' },
      },
    });

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain('#ff0000');
    expect(style.background).toContain('24px');
  });

  it('calls removeElement when hide is true', () => {
    const storyFn = jest.fn();
    withVRhythm(storyFn, { parameters: { vrhythm: { hide: true } } });

    expect(mockRemoveElement).toHaveBeenCalledTimes(1);
    expect(mockInjectStyle).not.toHaveBeenCalled();
  });

  it('merges partial parameters with defaults', () => {
    const storyFn = jest.fn();
    withVRhythm(storyFn, {
      parameters: {
        vrhythm: { color: '#abc123' },
      },
    });

    const style = mockInjectStyle.mock.calls[0][0];
    expect(style.background).toContain('#abc123');
    expect(style.background).toContain(DEFAULT_LINE_HEIGHT);
  });

  it('does not throw when hide is true and element is not in DOM', () => {
    const storyFn = jest.fn();
    expect(() =>
      withVRhythm(storyFn, { parameters: { vrhythm: { hide: true } } })
    ).not.toThrow();
  });
});
