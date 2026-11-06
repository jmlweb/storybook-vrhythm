---
id: TSK-002
title: Fix: Overlay stops at the first viewport on tall stories
status: pending
priority: P2
tags: []
created: 2026-11-06
source: report/RPT-002
depends-on: []
---

# Fix: Overlay stops at the first viewport on tall stories

## Description

### Summary

The overlay is `position: absolute` with `top` and `bottom` set, appended to the unpositioned `body`, so its containing block is the viewport-sized initial containing block. Content below the fold has no grid.

### Key Details

- Source: `src/getStyle.ts` sets `position: 'absolute'` and `bottom: 0`. `src/utils.ts` appends to `body`.
- Measured: overlay 700px high against a 3000px document, and against a 5698px Docs page.
- No error is raised.
- Related: PLN-001 (anchor the grid to the story root) could fix it more broadly. Keep this task's regression test either way.

## Acceptance Criteria

- [ ] On a story taller than the viewport, the overlay height matches the document scroll height
- [ ] The same holds on Docs pages
- [ ] A regression test measures overlay height against scrollHeight in a real browser

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created