---
id: TSK-006
title: Fix: container option has no working obvious target
status: pending
priority: P3
tags: []
created: 2026-11-06
source: report/RPT-006
depends-on: []
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

- [ ] A container element rendered by the story receives the overlay in the React, Vue and HTML apps
- [ ] Pointing container at the framework root keeps the overlay in the DOM, or the option rejects it with a clear message
- [ ] The audit error no longer says the overlay is hidden or missing when the overlay was removed

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created