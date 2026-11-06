---
id: RPT-003
title: Audit result depends on viewport height in centered layout
type: bug
severity: high
status: pending
created: 2026-11-06
---

## Summary

The grid origin is the viewport top, so in `layout: 'centered'` the same component passes or fails depending on the viewport height.

## Details

`resolveGrid` in `src/audit.ts` takes the overlay's top as the origin, and the overlay sits at y=0 on `body`. Centered stories land at an arbitrary y. `centered` is the Storybook scaffold's default for Button. README line 241 warns only about `padded`.

## Steps to Reproduce

1. Render a 48px tall box in a `layout: 'centered'` story with `parameters.vrhythm.lineHeight: '8px'`.
2. Run `auditRhythm(canvasElement)` at viewport heights 700, 701, 720 and 900.

## Expected vs Actual

Expected: the same result at every height, since the box is a multiple of the grid.
Actual: fails with 2 violations at 700, 701 and 900, passes at 720.

## Error messages/logs

Scaffold Button at height 700: `button.storybook-button top 332→336`.

`expectRhythm(canvasElement, { offset: 0 })` passed with origin at the root top, but the overlay stayed at y=0, so the picture and the numbers disagree. See the idea on anchoring the grid to the story root.
