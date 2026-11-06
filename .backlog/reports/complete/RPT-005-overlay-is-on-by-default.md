---
id: RPT-005
title: Overlay is on by default with no documented opt-out
type: improvement
severity: medium
status: triaged
created: 2026-11-06
triaged: 2026-11-06
task-id: TSK-005
---

## Summary

Installing the addon draws solid lines on every story and Docs page, and the docs give no way to default it off.

## Details

`initialGlobals.vrhythm` is `'true'` in `src/preview.ts` and the default colour is opaque `rgb(204, 204, 204)`.

## Current behavior

At the defaults, lines run through body text and read as strikethrough. Docs pages get a single body-wide overlay configured by the story that rendered last. Any screenshot of a story would include the grid. Neither the README nor `llms.txt` mentions Chromatic, visual tests or defaulting off.

## Proposed change

- Document a recipe to default the grid off. `initialGlobals: { vrhythm: 'false' }` should work but is untested.
- Document how to keep it out of visual tests.
- Use a softer default colour.
- Decide whether Docs should show the overlay at all.

## Expected benefit

Teams with visual regression or polished Docs pages can adopt it without noise. The first impression stays readable.
