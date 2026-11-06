---
id: RPT-006
title: container option has no working obvious target
type: bug
severity: medium
status: triaged
created: 2026-11-06
triaged: 2026-11-06
task-id: TSK-006
---

## Summary

`container` silently falls back to `body` for elements the story renders, and `#storybook-root` makes the overlay disappear.

## Details

The decorator calls `injectStyle` before `storyFn` in `src/withVRhythm.ts`, so story-rendered elements do not exist yet and `injectStyle` falls back to `body`. With `#storybook-root` the overlay is appended and then gone after render, most likely removed by the React render. Only React was tested.

## Steps to Reproduce

1. Set `container: '#mine'` on a story that renders `<div id="mine">`. Check the overlay's parent.
2. Set `container: '#storybook-root'` on any React story. Look for `#storybook-rhythm`.

## Expected vs Actual

Expected: the overlay sits inside the named container.
Actual: case 1 has parent `BODY`. Case 2 has no overlay in the DOM.

## Error messages/logs

Case 2 makes the audit throw a misleading error:

    RhythmConfigError: No grid found: the overlay is hidden or missing. Pass the lineHeight option.
