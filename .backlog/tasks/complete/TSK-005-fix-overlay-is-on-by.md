---
id: TSK-005
title: Fix: Overlay is on by default with no documented opt-out
status: complete
priority: P3
tags: []
created: 2026-11-06
source: report/RPT-005
depends-on: []
completed: 2026-11-06
started: 2026-11-06
---

# Fix: Overlay is on by default with no documented opt-out

## Description

### Summary

Installing the addon draws solid lines on every story and Docs page, and the docs give no way to default it off.

### Key Details

- `initialGlobals.vrhythm` is `'true'` in `src/preview.ts:46`. `initialGlobals` is not mentioned in the README or `llms.txt`.
- Default colour is opaque: `DEFAULT_COLOR = 'rgb(204, 204, 204)'`. At the defaults, lines run through body text and read as strikethrough.
- Docs pages get one body-wide overlay, configured by the story that rendered last.
- Screenshots and visual tests include the grid. The docs do not mention Chromatic.
- `initialGlobals: { vrhythm: 'false' }` should default it off. It is untested.
- Open question: soften the colour, and whether Docs should show the overlay. This overlaps with PLN-001.

## Acceptance Criteria

- [x] A recipe to default the grid off is verified in a real Storybook and documented in README and llms.txt — evidence: manual: scaffold with initialGlobals, overlay null, hidden audit passed on the offset grid; README Off by default, llms.txt Off by default (2026-11-07) (2026-11-06)
- [x] The docs say how to keep the grid out of visual regression tests — evidence: README Off by default covers Chromatic (2026-11-07) (2026-11-06)
- [x] Whether to soften the default colour and whether Docs shows the overlay is decided and recorded — evidence: Decided: default colour stays; Docs shows one page-anchored overlay. README Grid origin (2026-11-07) (2026-11-06)

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created
- [2026-11-06] Completed