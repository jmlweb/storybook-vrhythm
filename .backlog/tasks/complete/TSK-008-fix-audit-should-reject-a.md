---
id: TSK-008
title: Fix: Audit should reject a collapsed or off-canvas overlay
status: complete
priority: P3
tags: []
created: 2026-11-06
source: report/RPT-009
depends-on: []
completed: 2026-11-06
started: 2026-11-06
---

# Fix: Audit should reject a collapsed or off-canvas overlay

## Description

### Summary

The audit trusted a zero-height overlay at y=700 as its origin and returned `ok: true`.

### Key Details

- In `1.0.0-next.1`, numeric `offset` and `maxWidth` were not converted to pixels. `offset: 20` was dropped, so the overlay fell to y=700 with height 0. `maxWidth: 400` gave width 0.
- `ee857f8` fixes the conversion on `main`, and the changeset `reject-unmeasurable-audits` covers it. It is unreleased until `next.2`.
- `resolveGrid` in `src/audit.ts:135` reads the overlay's top with no size or position check, so another cause of a collapsed overlay would pass the same way.
- Related: TSK-003 changes how the origin is resolved, so do this one after it or together with it.

## Acceptance Criteria

- [x] auditRhythm throws RhythmConfigError when the overlay has zero height or width — evidence: overlay checks in test/audit.test.ts, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)
- [x] auditRhythm throws RhythmConfigError when the overlay lies outside the canvas — evidence: overlay checks in test/audit.test.ts, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)
- [x] Tests cover both cases and the offset: 20 case that returned ok: true on 1.0.0-next.1 — evidence: zero-height case at y=700 in test/audit.test.ts and OffsetOutsideTheRootIsRejected, pnpm -F @apps/react test → 37 passed (2026-11-07) (2026-11-06)

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created
- [2026-11-06] Completed