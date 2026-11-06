---
id: TSK-004
title: Fix: Documented global config is ignored with a default-exported preview
status: complete
priority: P3
tags: []
created: 2026-11-06
source: report/RPT-004
depends-on: []
completed: 2026-11-06
started: 2026-11-06
---

# Fix: Documented global config is ignored with a default-exported preview

## Description

### Summary

The global defaults snippet uses `export const parameters`. Next to the `export default preview` that `storybook init` scaffolds, it had no effect: the grid stayed 16px instead of 8px, with no error.

### Key Details

- Locations: `packages/storybook-vrhythm/README.md:79` and `packages/storybook-vrhythm/llms.txt:66`. Agents copy `llms.txt`.
- The manual decorator snippet (`README.md:157`, `llms.txt:56`) uses `export const decorators` and may fail the same way. It was not tested.
- Fix: put `parameters` inside the default-exported object in both files.

## Acceptance Criteria

- [x] README and llms.txt show parameters inside the default-exported preview object — evidence: README Global defaults, llms.txt Global defaults (2026-11-07) (2026-11-06)
- [x] The manual decorator snippet is verified on the storybook init scaffold, and fixed if it fails — evidence: manual: decorators in the default export ran on Storybook 10.6.6 scaffold; README and llms.txt updated (2026-11-07) (2026-11-06)
- [x] Following the docs on a fresh scaffold changes lineHeight from 16px to the configured value — evidence: manual: scaffold audit reported the 8px grid (2026-11-07) (2026-11-06)

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created
- [2026-11-06] Completed