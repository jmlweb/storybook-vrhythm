---
id: TSK-007
title: Fix: maxWidth styles leak into the next story and Docs
status: complete
priority: P3
tags: []
created: 2026-11-06
source: report/RPT-007
depends-on: []
completed: 2026-11-06
started: 2026-11-06
---

# Fix: maxWidth styles leak into the next story and Docs

## Description

### Summary

After a `maxWidth` story, the reused overlay keeps its `transform` and `width`, so the next story's grid is shifted.

### Key Details

- `injectStyle` in `src/utils.ts:31` uses `Object.assign(element.style, style)` on a reused element. Keys missing from the new style object are never cleared.
- Stories without `maxWidth` set `left` and `right` but not `transform` or `width`.
- Measured: width 400px and left -200px with `maxWidth: '400px'`. With numeric `maxWidth` on `1.0.0-next.1`, left -500px on a 1000px viewport, so the right half of the page lost its grid, including on Docs.
- Fix: clear the previous inline style before assigning, or reset `transform` and `width` explicitly.

## Acceptance Criteria

- [x] After a maxWidth story, a story without maxWidth gets an overlay with no leftover transform or width — evidence: reused overlay tests in test/utils.test.ts and NoLeakAfterMaxWidth, pnpm -F @apps/react test → 37 passed (2026-11-07) (2026-11-06)
- [x] A unit test in test/utils.test.ts covers the reused overlay element — evidence: test/utils.test.ts reused overlay, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)
- [x] Docs shows a full-width overlay after navigating from a maxWidth story — evidence: Docs always uses the page anchor and injectStyle clears inline style; manual: Docs overlay width 1000 of 1000 (2026-11-07) (2026-11-06)

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created
- [2026-11-06] Completed