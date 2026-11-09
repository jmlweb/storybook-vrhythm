import { useEffect, useRef, useState } from 'react';
import { auditRhythm, expectRhythm } from 'storybook-vrhythm/audit';

import { AuditPanel, type AuditResult, AuditStatus } from './audit-panel';
import { DemoCard } from './demo-card';

const GRID_SIZES = [4, 8, 12, 16, 24] as const;
type GridSize = (typeof GRID_SIZES)[number];

const CARD_GRID: GridSize = 8;
const ON_GRID_HEADING = 40;
const OFF_GRID_HEADING = 38;
const MIN_HEADING = 32;
const MAX_HEADING = 48;

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const runAudit = async (
  root: Element,
  lineHeight: number
): Promise<AuditResult> => {
  try {
    const report = await auditRhythm(root, { lineHeight });
    if (report.ok) {
      return { status: AuditStatus.PASS, checked: report.checked };
    }

    // The failure text comes from the addon itself, so the page shows exactly
    // what a story test or an agent would read.
    const message = await expectRhythm(root, { lineHeight }).then(
      () => '',
      toMessage
    );
    return {
      status: AuditStatus.FAIL,
      message,
      violations: report.violations,
    };
  } catch (error) {
    return { status: AuditStatus.ERROR, message: toMessage(error) };
  }
};

const formatDelta = (delta: number): string =>
  `${delta > 0 ? '+' : ''}${delta}px`;

const Markers = ({ result }: { result: AuditResult }) => {
  if (result.status !== AuditStatus.FAIL) {
    return null;
  }

  const positions = [
    ...new Set(result.violations.map(({ actual }) => actual)),
  ].sort((a, b) => a - b);
  const first = [...result.violations].sort((a, b) => a.actual - b.actual)[0];

  return (
    <div className="stage__markers" aria-hidden="true">
      {positions.map((top) => (
        <span key={top} className="marker" style={{ top }}>
          {top === first.actual && (
            <span className="marker__label">
              {first.edge} {formatDelta(first.delta)}
            </span>
          )}
        </span>
      ))}
    </div>
  );
};

const StatusBadge = ({ result }: { result: AuditResult }) => {
  if (result.status === AuditStatus.PASS) {
    return <span className="badge badge--pass">On grid</span>;
  }
  if (result.status === AuditStatus.FAIL) {
    return (
      <span className="badge badge--fail">
        {result.violations.length} edges off grid
      </span>
    );
  }
  return null;
};

export const Playground = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState<GridSize>(CARD_GRID);
  const [headingLineHeight, setHeadingLineHeight] = useState(ON_GRID_HEADING);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [result, setResult] = useState<AuditResult>({
    status: AuditStatus.PENDING,
  });

  // The heading's line height changes layout, so the audit must rerun on it
  // even though the effect never reads the value.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let latestRun = 0;
    const audit = async () => {
      latestRun += 1;
      const run = latestRun;
      const next = await runAudit(root, gridSize);
      // A slower, older audit must not overwrite a newer result.
      if (run === latestRun) {
        setResult(next);
      }
    };

    // The observer also fires once on `observe`, which runs the first audit.
    // After that it covers text rewrapping when the viewport changes.
    const observer = new ResizeObserver(audit);
    observer.observe(root);

    return () => {
      latestRun = Number.POSITIVE_INFINITY;
      observer.disconnect();
    };
  }, [gridSize, headingLineHeight]);

  const isOnGrid = result.status === AuditStatus.PASS;
  const toggleRhythm = () => {
    setGridSize(CARD_GRID);
    setHeadingLineHeight(isOnGrid ? OFF_GRID_HEADING : ON_GRID_HEADING);
  };

  return (
    <section className="section" id="playground">
      <div className="section__head">
        <p className="kicker">Playground</p>
        <h2 className="section__title">Break the rhythm. Read the fix.</h2>
        <p className="section__lead">
          This card is measured by the real audit, in your browser. Nudge the
          heading off the grid and the failure names the edge, the distance and
          the way back.
        </p>
      </div>

      <div className="playground">
        <div className="stage">
          <StatusBadge result={result} />
          <div className="stage__frame">
            <div className="stage__root" ref={rootRef}>
              <DemoCard headingLineHeight={headingLineHeight} />
            </div>
            {isGridVisible && (
              <div
                className="stage__grid"
                aria-hidden="true"
                style={{ backgroundSize: `100% ${gridSize}px` }}
              />
            )}
            <Markers result={result} />
          </div>
        </div>

        <div className="playground__side">
          <div className="controls">
            <fieldset className="control">
              <legend className="control__label">Grid size</legend>
              <div className="segmented">
                {GRID_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="segmented__item"
                    aria-pressed={size === gridSize}
                    onClick={() => setGridSize(size)}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="control">
              <label className="control__label" htmlFor="heading-line-height">
                Heading line height
                <output className="control__value">
                  {headingLineHeight}px
                </output>
              </label>
              <input
                id="heading-line-height"
                className="slider"
                type="range"
                min={MIN_HEADING}
                max={MAX_HEADING}
                value={headingLineHeight}
                onChange={(event) =>
                  setHeadingLineHeight(Number(event.target.value))
                }
              />
            </div>

            <div className="controls__row">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isGridVisible}
                  onChange={(event) => setIsGridVisible(event.target.checked)}
                />
                <span className="switch__track" aria-hidden="true" />
                Show overlay
              </label>
              <button
                type="button"
                className={`button button--small ${isOnGrid ? 'button--danger' : 'button--success'}`}
                onClick={toggleRhythm}
              >
                {isOnGrid ? 'Break the rhythm' : 'Fix it'}
              </button>
            </div>
          </div>

          <AuditPanel result={result} gridSize={gridSize} />
        </div>
      </div>
    </section>
  );
};
