---
id: RPT-004
title: Documented global config is ignored with a default-exported preview
type: bug
severity: medium
status: pending
created: 2026-11-06
---

## Summary

The global defaults snippet uses `export const parameters`, which had no effect next to the `export default preview` that `storybook init` scaffolds.

## Details

The snippet appears at `packages/storybook-vrhythm/README.md:79` and `packages/storybook-vrhythm/llms.txt:66`, so coding agents copy it too. The manual decorator snippet, `export const decorators`, may fail the same way. That was not tested.

## Steps to Reproduce

1. Scaffold with `storybook init`, which produces `const preview: Preview = {...}; export default preview`.
2. Append the README's `export const parameters` block with `lineHeight: '8px'`.
3. Build and open any story.

## Expected vs Actual

Expected: an 8px grid.
Actual: `data-vrhythm-line-height` is `16px`, the default.

## Error messages/logs

None. The snippet is silently ignored.

Fix: show the `parameters` key inside the default-exported object in both files.
