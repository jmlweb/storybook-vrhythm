---
id: TSK-003
title: Fix: Audit result depends on viewport height in centered layout
status: pending
priority: P2
tags: []
created: 2026-11-06
source: report/RPT-003
depends-on: []
---

# Fix: Audit result depends on viewport height in centered layout

## Description

### Summary

`resolveGrid` in `src/audit.ts` takes the overlay's top as the grid origin, and the overlay sits at y=0 on `body`. In `layout: 'centered'` a story lands at an arbitrary y, so the same component passes or fails depending on viewport height.

### Key Details

- Repro: a 48px box in a centered story with `lineHeight: '8px'`. Fails with 2 violations at heights 700, 701 and 900. Passes at 720.
- `centered` is the scaffold default for Button. README line 241 warns only about `padded`.
- `expectRhythm(canvasElement, { offset: 0 })` passed with origin at the root top, but the overlay stayed at y=0, so the picture and the numbers disagree.
- Related: TSK-002 (same overlay positioning) and PLN-001 (anchor to the story root).

## Acceptance Criteria

- [ ] The audit gives the same result for a layout-centered story at viewport heights 700, 701, 720 and 900
- [ ] The overlay and the audit use the same origin
- [ ] README explains which layouts the audit supports

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created