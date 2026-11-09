import type { RhythmViolation } from 'storybook-vrhythm/audit';

export const AuditStatus = {
  PENDING: 'pending',
  PASS: 'pass',
  FAIL: 'fail',
  ERROR: 'error',
} as const;

export type AuditResult =
  | { status: typeof AuditStatus.PENDING }
  | { status: typeof AuditStatus.PASS; checked: number }
  | {
      status: typeof AuditStatus.FAIL;
      message: string;
      violations: readonly RhythmViolation[];
    }
  | { status: typeof AuditStatus.ERROR; message: string };

const FIX_PREFIX = 'Fix from the top';

const Output = ({
  result,
  gridSize,
}: {
  result: AuditResult;
  gridSize: number;
}) => {
  if (result.status === AuditStatus.PENDING) {
    return <span className="terminal__muted">Measuring…</span>;
  }
  if (result.status === AuditStatus.PASS) {
    return (
      <span className="terminal__pass">
        ✓ {result.checked} edges measured, all on the {gridSize}px grid
      </span>
    );
  }
  if (result.status === AuditStatus.ERROR) {
    return <span className="terminal__fail">✗ {result.message}</span>;
  }

  return (
    <>
      <span className="terminal__fail">✗ RhythmAssertionError: OFF_GRID</span>
      {result.message.split('\n').map((line) => (
        <span
          key={line}
          className={line.startsWith(FIX_PREFIX) ? 'terminal__fix' : undefined}
        >
          {line}
        </span>
      ))}
    </>
  );
};

export const AuditPanel = ({
  result,
  gridSize,
}: {
  result: AuditResult;
  gridSize: number;
}) => (
  <div className="terminal">
    <div className="terminal__bar">
      <span className="terminal__dots" aria-hidden="true" />
      <span className="terminal__title">Audit output, live</span>
    </div>
    <pre className="terminal__body" role="status" aria-live="polite">
      <span className="terminal__muted">
        await expectRhythm(card, {'{'} lineHeight: {gridSize} {'}'})
      </span>
      <Output result={result} gridSize={gridSize} />
    </pre>
  </div>
);
