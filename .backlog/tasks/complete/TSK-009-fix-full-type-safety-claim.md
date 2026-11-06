---
id: TSK-009
title: Fix: Full type safety claim does not hold for classic registration
status: complete
priority: P4
tags: []
created: 2026-11-06
source: report/RPT-008
depends-on: []
completed: 2026-11-06
started: 2026-11-06
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

- [x] README states where parameters.vrhythm is type-checked and where it is not — evidence: README Config options and llms.txt TypeScript (2026-11-07) (2026-11-06)
- [x] An unknown preset name is a type error or triggers a dev-time warning — evidence: console.warn plus UNKNOWN_PRESET from the audit, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)
- [x] A test or type test covers an invalid lineHeight and an unknown preset — evidence: test/index.test.ts unknown preset and test/audit.test.ts unsupported lineHeight, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created
- [2026-11-06] Resolved with a dev-time warning. preset stays open as PresetName | (string & {}), which gives completion only.
- [2026-11-06] Completed