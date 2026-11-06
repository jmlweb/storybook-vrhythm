---
id: RPT-007
title: maxWidth styles leak into the next story and Docs
type: bug
severity: medium
status: triaged
created: 2026-11-06
triaged: 2026-11-06
task-id: TSK-007
---

## Summary

After a `maxWidth` story, the reused overlay keeps its `transform` and `width`, so the next story's grid is shifted.

## Details

`injectStyle` in `src/utils.ts` uses `Object.assign(element.style, style)` on a reused element. Keys missing from the new style object are never cleared. Stories without `maxWidth` set `left` and `right` but not `transform` or `width`.

## Steps to Reproduce

1. Open a story with `vrhythm: { maxWidth: '400px' }`.
2. Navigate without a reload to a story that has no `maxWidth`.
3. Measure `#storybook-rhythm`.

## Expected vs Actual

Expected: left 0, width 100%.
Actual: width 400px and left -200px with `maxWidth: '400px'`. With the numeric `maxWidth` in `next.1`, left -500px on a 1000px viewport, and the right half of the page lost its grid, including on Docs.

## Error messages/logs

None.

Fix: clear the previous inline style before assigning, or reset `transform` and `width` explicitly.
