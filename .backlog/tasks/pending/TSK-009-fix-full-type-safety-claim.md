---
id: TSK-009
title: Fix: Full type safety claim does not hold for classic registration
status: pending
priority: P4
tags: []
created: 2026-11-06
source: report/RPT-008
depends-on: []
---

# Fix: Full type safety claim does not hold for classic registration

## Description

### Summary

README line 25 claims "Full type safety", but classic registration accepts invalid parameters, and an unknown preset is ignored at runtime.

### Key Details

- `src/types.ts:32` types `preset` as `string`, so an unknown name is never a type error. `src/withVRhythm.ts:55` falls back to `{}`.
- Precise typing for `parameters.vrhythm` comes from CSF Next's `definePreviewAddon`. With `addons: ['storybook-vrhythm']`, `StoryObj` does not check it.
- Seen on Storybook 10.6.6: `parameters: { vrhythm: { lineHeight: true, preset: 'nope' } }` passes `tsc`. The runtime fallback comes from reading the code and was not run.
- A preset typo gives a default 16px grid with no warning.

## Acceptance Criteria

- [ ] README states where parameters.vrhythm is type-checked and where it is not
- [ ] An unknown preset name is a type error or triggers a dev-time warning
- [ ] A test or type test covers an invalid lineHeight and an unknown preset

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created