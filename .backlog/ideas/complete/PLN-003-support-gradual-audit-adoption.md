---
id: PLN-003
title: Support gradual audit adoption
status: approved
created: 2026-11-06
complexity: medium
reviewed: 2026-11-06
task-id: TSK-011
---

## Goal

Let a team adopt the audit on an existing design system without fixing everything at once, and make repeated deltas easier to read.

## Context

The first run on scaffold components failed 7 of 8 edges on Header and 25 of 26 on Page at 8px. 5 of the 7 Header lines are the same `-1px`. The output is correct, but it reads as many problems when there are few causes. Checking both edges of every box also rejects any component whose height is off the grid.

## Approach

1. Add an `edges` option such as `['top']`, defaulting to both edges so behaviour is unchanged. `checks` already picks what to measure (`'box'` or `'baseline'`), and `edges` picks which box edges. Decide whether `edges` filters in `collectMeasurements`, so `report.checked` shrinks, or filters violations afterwards, so `checked` stays. Document the choice, because it changes what `checked` means.
2. Group violations with the same `delta` in the `expectRhythm` message, by equal value and not by adjacency, because tree order separates equal deltas (the five `-1px` Header lines are not adjacent). Keep the full list in `report.violations`.
3. Decide how the `MAX_REPORTED_VIOLATIONS = 10` cap (`src/audit.ts:51`) counts: groups or lines. Keep the `...and N more` count truthful.
4. Add tests: `test/audit.test.ts` for the option and the message, and `test/find-violations.test.ts` if the grouping lives there.
5. Update the `llms.txt` fix workflow, which agents follow, and the README with the adoption path: start with `edges: ['top']` on new components, then tighten. Say that a `top`-only check misses a wrong height.
6. Add a changeset.

## Files to Modify

- `packages/storybook-vrhythm/src/audit.ts` — `edges` option, grouped message, cap
- `packages/storybook-vrhythm/src/find-violations.ts` — grouping, keeping it pure
- `packages/storybook-vrhythm/test/audit.test.ts` and `test/find-violations.test.ts` — option and message coverage
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — option, adoption path, fix workflow
- `.changeset/` — new changeset

## Risks & Considerations

- The agent workflow reads each `delta`, so grouping must not hide values agents act on.
- Equal deltas do not prove a shared cause, so word the grouping as a pattern and not a diagnosis.
- `edges` overlaps `checks`. Two options that both narrow the audit need clear naming and docs.
- Changing what `report.checked` means could surprise anyone who asserts on it.

## Revision History

- [2026-11-06] Defined where `edges` filters and its effect on `checked`; grouped by equal delta; added cap, named test files, changeset and `llms.txt` workflow update; moved the known-violations question to its own idea.
