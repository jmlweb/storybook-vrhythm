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

const addReport = (
  { reporting }: AfterEachContext,
  status: Report['status'],
  result: RhythmReport | string
) => reporting.addReport({ type: REPORT_TYPE, version: 1, result, status });

const warn = async (
  context: AfterEachContext,
  error: Error,
  result: RhythmReport | string = error.message
) => {
  console.warn(`storybook-vrhythm: ${error.message}`);
  await addReport(context, 'warning', result);
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

  try {
    const report = await auditRhythm(
      context.canvasElement as Element,
      toAuditOptions(resolved)
    );
    const error = toAssertionError(report);

    if (!error) {
      await addReport(context, 'passed', report);
      return;
    }
    if (audit === 'todo') {
      await warn(context, error, report);
      return;
    }

    await addReport(context, 'failed', report);
    throw error;
  } catch (error) {
    if (audit !== 'todo') {
      throw error;
    }
    await warn(context, error as Error);
  }
};
