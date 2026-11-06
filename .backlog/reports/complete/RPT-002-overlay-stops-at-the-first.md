---
id: RPT-002
title: Overlay stops at the first viewport on tall stories
type: bug
severity: high
status: triaged
created: 2026-11-06
triaged: 2026-11-06
task-id: TSK-002
---

## Summary

The overlay is only as tall as the viewport, so content below the fold has no grid.

## Details

The overlay is `position: absolute` with `top` and `bottom` set, appended to `body`. `body` is not positioned, so the containing block is the initial containing block, which has the viewport's size. See `src/getStyle.ts` and `src/utils.ts`.

## Steps to Reproduce

1. Render a story with `layout: 'fullscreen'` and a 3000px tall element.
2. Open it with a 700px high viewport.
3. Measure `#storybook-rhythm` and scroll down.

## Expected vs Actual

Expected: the grid covers the whole document.
Actual: overlay height 700px against a `scrollHeight` of 3000px. Docs measured the same 700px against 5698px.

## Error messages/logs

None. The failure is silent.
