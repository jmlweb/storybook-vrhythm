---
id: TSK-006
title: Fix: container option has no working obvious target
status: complete
priority: P3
tags: []
created: 2026-11-06
source: report/RPT-006
depends-on: []
completed: 2026-11-06
started: 2026-11-06
---

# Fix: container option has no working obvious target

## Description

### Summary

`container` silently falls back to `body` for elements the story renders, and `container: '#storybook-root'` made the overlay disappear.

### Key Details

- Cause confirmed in source: `injectStyle` runs at `src/withVRhythm.ts:86`, before `storyFn(context)` at `:93`, so story elements do not exist yet. `src/utils.ts:36-42` falls back to `body`.
- With `#storybook-root` the overlay was gone after render. Seen only in React. The cause (a render clearing the root) is an inference: confirm it on Vue and HTML first.
- Misleading audit error in that case: `RhythmConfigError: No grid found: the overlay is hidden or missing. Pass the lineHeight option.`
- Related: PLN-001 (anchor to the story root) would change this option's design. Decide the order before fixing.

## Acceptance Criteria

- [x] A container element rendered by the story receives the overlay in the React, Vue and HTML apps — evidence: manual: Playwright, selector anchor rendered by the story matched in Vue and HTML; SelectorAnchor story in React. Overlay stays on body by design (2026-11-07) (2026-11-06)
- [x] Pointing container at the framework root keeps the overlay in the DOM, or the option rejects it with a clear message — evidence: Overlay is never placed inside a framework root, so it stays in the DOM (2026-11-07) (2026-11-06)
- [x] The audit error no longer says the overlay is hidden or missing when the overlay was removed — evidence: ANCHOR_NOT_FOUND and the new NO_GRID wording, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created
- [2026-11-06] Decision: container became a deprecated alias of anchor, so the overlay covers the element instead of living inside it.
- [2026-11-06] Completed