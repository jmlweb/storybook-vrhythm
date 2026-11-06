---
id: TSK-011
title: Support gradual audit adoption
status: pending
priority: P2
tags: []
created: 2026-11-06
source: idea/PLN-003
depends-on: []
---

# Support gradual audit adoption

## Description

### Goal

Let a team adopt the audit on an existing design system without fixing everything at once, and make repeated deltas easier to read.

### Context

The first run on scaffold components failed 7 of 8 edges on Header and 25 of 26 on Page at 8px. 5 of the 7 Header lines are the same `-1px`. The output is correct, but it reads as many problems when there are few causes. Checking both edges of every box also rejects any component whose height is off the grid.

### Approach

1. Add an `edges` option such as `['top']`, defaulting to both edges so behaviour is unchanged. `checks` already picks what to measure (`'box'` or `'baseline'`), and `edges` picks which box edges.
   - Filter in `collectMeasurements`, so `report.checked` counts what was measured. `expectRhythm` treats `checked === 0` as nothing measured (`audit.ts:405`), and filtering after collection would keep `checked` above 0 when nothing was tested. Document this meaning of `checked`.
   - Type it as `'top' | 'bottom'`, not `RhythmEdge`, which includes `'baseline'` and would clash with `checks`.
   - Reject an empty `edges` with `RhythmConfigError`.
2. Group violations with the same `delta` in the `expectRhythm` message, by equal value and not by adjacency, because tree order separates equal deltas (the five `-1px` Header lines are not adjacent). Keep the full list in `report.violations`.
3. Decide how the `MAX_REPORTED_VIOLATIONS = 10` cap (`src/audit.ts:51`) counts: groups or lines. Keep the `...and N more` count truthful.
4. Add tests: `test/audit.test.ts` for the option and the message, and `test/find-violations.test.ts` if the grouping lives there.
5. Update the `llms.txt` fix workflow, which agents follow, and the README with the adoption path: start with `edges: ['top']` on new components, then tighten. Say that a `top`-only check misses a wrong height.
6. Add a changeset.

### Risks & Considerations

- The agent workflow reads each `delta`, so grouping must not hide values agents act on.
- Equal deltas do not prove a shared cause, so word the grouping as a pattern and not a diagnosis.
- `edges` overlaps `checks`. Two options that both narrow the audit need clear naming and docs.
- PLN-005 depends on this work, so do this first.

## Acceptance Criteria

- [ ] `edges` option typed as top or bottom, defaulting to both edges, so default behaviour is unchanged
- [ ] `edges` filters in collectMeasurements, so report.checked counts what was measured and the checked === 0 guard still works; the meaning of checked is documented
- [ ] Empty `edges` throws RhythmConfigError
- [ ] expectRhythm message groups violations by equal delta, not adjacency, worded as a pattern and not a diagnosis; report.violations keeps the full list
- [ ] MAX_REPORTED_VIOLATIONS counting is decided and the ...and N more count stays truthful
- [ ] Tests cover the option and the message in test/audit.test.ts, and in test/find-violations.test.ts if grouping lives there
- [ ] llms.txt fix workflow and README adoption path are updated, and say a top-only check misses a wrong height
- [ ] Changeset added

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created