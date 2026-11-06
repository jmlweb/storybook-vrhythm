import type { AuditOptions, RhythmReport } from './audit';
import { auditRhythm } from './audit';
import { DEFAULT_LINE_HEIGHT, DEFAULT_OFFSET } from './constants';
import {
  type ResolvedParams,
  resolveParams,
  type VRhythmContext,
} from './resolve-params';
import {
  createError,
  RhythmErrorCode,
  toAssertionError,
} from './rhythm-errors';

interface Report {
  type: string;
  version?: number;
  result: unknown;
  status: 'failed' | 'passed' | 'warning';
}

interface AfterEachContext extends VRhythmContext {
  canvasElement: unknown;
  reporting: { addReport: (report: Report) => unknown };
}

const REPORT_TYPE = 'vrhythm';
const AUDIT_MODES: ReadonlySet<unknown> = new Set(['error', 'todo', 'off']);

// A hidden overlay publishes no grid, and hiding the picture must not change the
// check, so the audit gets the same grid the overlay would have drawn.
const toAuditOptions = ({
  params,
  isHidden,
  anchor,
  unknownPreset,
}: ResolvedParams): AuditOptions => {
  if (!isHidden) {
    return { ...params.auditOptions };
  }
  if (unknownPreset) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.UNKNOWN_PRESET,
      `Unknown preset "${unknownPreset}": the grid fell back to its default. Fix the preset name.`
    );
  }

  return {
    lineHeight: params.lineHeight ?? DEFAULT_LINE_HEIGHT,
    offset: params.offset ?? DEFAULT_OFFSET,
    anchor,
    ...params.auditOptions,
  };
};

// Reporting is a side channel: a broken reporter must not decide a story's result.
const addReport = async (
  { reporting }: AfterEachContext,
  status: Report['status'],
  result: RhythmReport | string
): Promise<void> => {
  try {
    await reporting.addReport({
      type: REPORT_TYPE,
      version: 1,
      result,
      status,
    });
  } catch (error) {
    console.warn(`storybook-vrhythm: could not add a report: ${error}`);
  }
};

const auditStory = async (
  context: AfterEachContext,
  resolved: ResolvedParams
): Promise<{ report?: RhythmReport; error: Error | null }> => {
  try {
    const report = await auditRhythm(
      context.canvasElement as Element,
      toAuditOptions(resolved)
    );
    return { report, error: toAssertionError(report) };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Preview `afterEach` behind `parameters.vrhythm.audit`.
 *
 * A failed report alone neither fails a Vitest run nor reaches
 * `@storybook/addon-mcp`, so `'error'` throws. `'todo'` never fails a story.
 */
export const runAutoAudit = async (
  context: AfterEachContext
): Promise<void> => {
  const resolved = resolveParams(context);
  const { audit = 'off' } = resolved.params;

  if (audit === 'off' || context.viewMode === 'docs') {
    return;
  }
  // Reading a typo as 'off' would turn the audit off with a green result.
  if (!AUDIT_MODES.has(audit)) {
    throw createError(
      'RhythmConfigError',
      RhythmErrorCode.INVALID_AUDIT_MODE,
      `audit must be 'error', 'todo' or 'off', got "${audit}".`
    );
  }

  const { report, error } = await auditStory(context, resolved);

  if (!error) {
    await addReport(context, 'passed', report as RhythmReport);
    return;
  }
  if (audit === 'todo') {
    console.warn(`storybook-vrhythm: ${error.message}`);
    await addReport(context, 'warning', report ?? error.message);
    return;
  }
  if (report) {
    await addReport(context, 'failed', report);
  }
  throw error;
};
