---
id: RPT-009
title: Audit should reject a collapsed or off-canvas overlay
type: improvement
severity: medium
status: pending
created: 2026-11-06
---

## Summary

The audit trusted a zero-height overlay at y=700 as its origin and returned `ok: true`.

## Details

In `1.0.0-next.1`, numeric `offset` and `maxWidth` were not converted to pixels, so `offset: 20` was dropped and the overlay fell to y=700 with height 0. `maxWidth: 400` gave width 0. `ee857f8` fixes the conversion on `main` and the pending changeset `reject-unmeasurable-audits` covers it, but it is unreleased.

## Current behavior

`resolveGrid` in `src/audit.ts` reads the overlay's top without checking that the overlay is usable. With `offset: 20` on `next.1`, the report was `ok: true`, `checked: 2`, origin 700.

## Proposed change

- Throw `RhythmConfigError` when the overlay has zero height or width, or sits outside the canvas.
- Publish `next.2` so the conversion fix reaches users.

## Expected benefit

This extends the "reject audits that cannot give a real answer" direction to the next way an audit can pass on bad input.
