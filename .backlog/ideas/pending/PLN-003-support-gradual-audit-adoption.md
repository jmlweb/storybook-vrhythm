---
id: PLN-003
title: Support gradual audit adoption
status: pending
created: 2026-11-06
complexity: medium
---

## Goal

Let a team adopt the audit on an existing design system without fixing everything at once, and make repeated deltas easier to read.

## Context

The first run on scaffold components failed 7 of 8 edges on Header and 25 of 26 on Page at 8px. 5 of the 7 Header lines are the same `-1px`. The output is correct, but it reads as many problems when there are few causes. Checking both edges of every box also rejects any component whose height is off the grid.

## Approach

1. Add an `edges` option such as `['top']`, defaulting to both edges so behaviour is unchanged.
2. Group consecutive violations with the same delta in the `expectRhythm` message, keeping the full list in `report.violations`.
3. Document a suggested path: start with `edges: ['top']` on new components, then tighten.

## Files to Modify

- `packages/storybook-vrhythm/src/audit.ts` — `edges` option, grouped message
- `packages/storybook-vrhythm/src/find-violations.ts` — grouping, keeping it pure
- `packages/storybook-vrhythm/test/` — new option and message coverage
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — option and adoption path

## Risks & Considerations

- The agent workflow reads each `delta`, so grouping must not hide values agents act on.
- Equal deltas do not prove a shared cause, so word the grouping as a pattern and not a diagnosis.

## Open Questions

- Should there also be a way to record known violations and fail only on new ones?
