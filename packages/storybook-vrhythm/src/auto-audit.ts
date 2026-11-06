import type { AuditOptions } from './audit';
import { auditRhythm } from './audit';
import { DEFAULT_LINE_HEIGHT } from './constants';
import { resolveParams, type VRhythmContext } from './resolve-params';
import { createError, formatFailure, RhythmErrorCode } from './rhythm-errors';

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

/**
 * Preview `afterEach` behind `parameters.vrhythm.audit`.
 *
 * A failed report alone neither fails a Vitest run nor reaches
 * `@storybook/addon-mcp`, so `'error'` throws.
 */
export const runAutoAudit = async (
  context: AfterEachContext
): Promise<void> => {
  const { params, isHidden } = resolveParams(context);
  const { audit = 'off', auditOptions } = params;

  if (audit === 'off' || context.viewMode === 'docs') {
    return;
  }

  // A hidden overlay publishes no grid, and hiding the picture must not skip the check.
  const options: AuditOptions = isHidden
    ? { lineHeight: params.lineHeight ?? DEFAULT_LINE_HEIGHT, ...auditOptions }
    : { ...auditOptions };
  const report = await auditRhythm(context.canvasElement as Element, options);

  // Stories that render nothing here, such as portals, have nothing to judge.
  if (report.ok) {
    await context.reporting.addReport({
      type: REPORT_TYPE,
      version: 1,
      result: report,
      status: 'passed',
    });
    return;
  }

  const message = formatFailure(report);
  await context.reporting.addReport({
    type: REPORT_TYPE,
    version: 1,
    result: report,
    status: audit === 'todo' ? 'warning' : 'failed',
  });

  if (audit === 'todo') {
    console.warn(`storybook-vrhythm: ${message}`);
    return;
  }

  throw createError('RhythmAssertionError', RhythmErrorCode.OFF_GRID, message, {
    report,
  });
};
