import { vi } from 'vitest';
import { runAutoAudit } from '../src/auto-audit';
import { DIV_ID } from '../src/constants';
import { injectStyle } from '../src/utils';

const rect = (top: number, height: number) =>
  ({ top, bottom: top + height, height, width: 100 }) as DOMRect;

const createStory = (childTop: number): HTMLElement => {
  const root = document.body.appendChild(document.createElement('div'));
  root.getBoundingClientRect = () => rect(0, 800);
  const child = root.appendChild(document.createElement('div'));
  child.getBoundingClientRect = () => rect(childTop, 16);
  return root;
};

const showOverlay = () => {
  injectStyle({}, { vrhythmLineHeight: '8px' });
  (document.getElementById(DIV_ID) as HTMLElement).getBoundingClientRect = () =>
    rect(0, 800);
};

const contextFor = (
  canvasElement: HTMLElement,
  vrhythm: Record<string, unknown>,
  rest: Record<string, unknown> = {}
) => ({
  canvasElement,
  parameters: { vrhythm },
  viewMode: 'story',
  reporting: { addReport: vi.fn() },
  ...rest,
});

beforeEach(() => {
  document.body.replaceChildren();
});

describe('runAutoAudit', () => {
  it('does nothing by default', async () => {
    const context = contextFor(createStory(3), {});

    await runAutoAudit(context);

    expect(context.reporting.addReport).not.toHaveBeenCalled();
  });

  it('skips Docs', async () => {
    const context = contextFor(
      createStory(3),
      { audit: 'error', lineHeight: '8px' },
      { viewMode: 'docs' }
    );

    await expect(runAutoAudit(context)).resolves.toBeUndefined();
  });

  it('throws on violations in error mode', async () => {
    showOverlay();
    const context = contextFor(createStory(3), { audit: 'error' });

    await expect(runAutoAudit(context)).rejects.toMatchObject({
      name: 'RhythmAssertionError',
      code: 'OFF_GRID',
    });
    expect(context.reporting.addReport).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'vrhythm', status: 'failed' })
    );
  });

  it('only warns in todo mode', async () => {
    showOverlay();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const context = contextFor(createStory(3), { audit: 'todo' });

    await expect(runAutoAudit(context)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('delta 3px'));
    expect(context.reporting.addReport).toHaveBeenCalledTimes(1);
    expect(context.reporting.addReport).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'warning',
        result: expect.objectContaining({ ok: false }),
      })
    );
    warn.mockRestore();
  });

  it('does not fail on a bad setup in todo mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const context = contextFor(createStory(3), {
      audit: 'todo',
      auditOptions: { edges: [] },
    });

    await expect(runAutoAudit(context)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('edges'));
    warn.mockRestore();
  });

  it('reports a pass', async () => {
    showOverlay();
    const context = contextFor(createStory(8), { audit: 'error' });

    await runAutoAudit(context);

    expect(context.reporting.addReport).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'passed' })
    );
  });

  it('still audits with a hidden overlay, using the story grid', async () => {
    const context = contextFor(createStory(3), {
      audit: 'error',
      hide: true,
      preset: '8px',
    });

    await expect(runAutoAudit(context)).rejects.toThrow('8px grid');
  });

  it('does not fail in todo mode when reporting fails', async () => {
    showOverlay();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const context = contextFor(createStory(3), { audit: 'todo' });
    context.reporting.addReport.mockRejectedValue(new Error('broken'));

    await expect(runAutoAudit(context)).resolves.toBeUndefined();

    warn.mockRestore();
  });

  it('keeps the audit error when reporting fails', async () => {
    showOverlay();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const context = contextFor(createStory(3), { audit: 'error' });
    context.reporting.addReport.mockRejectedValue(new Error('broken'));

    await expect(runAutoAudit(context)).rejects.toMatchObject({
      code: 'OFF_GRID',
    });

    warn.mockRestore();
  });

  it('audits a hidden overlay on the grid a visible one would use', async () => {
    const root = createStory(12);

    await expect(
      runAutoAudit(
        contextFor(root, {
          audit: 'error',
          hide: true,
          preset: '8px',
          offset: 4,
        })
      )
    ).resolves.toBeUndefined();
  });

  it('rejects an unknown preset with a hidden overlay', async () => {
    const context = contextFor(createStory(8), {
      audit: 'error',
      hide: true,
      preset: 'nope',
    });

    await expect(runAutoAudit(context)).rejects.toMatchObject({
      code: 'UNKNOWN_PRESET',
    });
  });

  it('fails a story with nothing to measure', async () => {
    showOverlay();
    const root = document.body.appendChild(document.createElement('div'));
    root.getBoundingClientRect = () => rect(0, 0);

    await expect(
      runAutoAudit(contextFor(root, { audit: 'error' }))
    ).rejects.toMatchObject({ code: 'NOTHING_MEASURED' });
  });

  it('forwards auditOptions', async () => {
    showOverlay();
    const context = contextFor(createStory(3), {
      audit: 'error',
      auditOptions: { tolerance: 3 },
    });

    await expect(runAutoAudit(context)).resolves.toBeUndefined();
  });
});
