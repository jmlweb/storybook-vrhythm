---
id: RPT-008
title: Full type safety claim does not hold for classic registration
type: finding
severity: low
status: pending
created: 2026-11-06
---

## Summary

README line 25 claims full type safety, but classic registration accepts invalid parameters, and an unknown preset is ignored at runtime.

## Details

The precise typing comes from CSF Next's `definePreviewAddon`. With `addons: ['storybook-vrhythm']`, `StoryObj` does not check `parameters.vrhythm`.

## Where found

`packages/storybook-vrhythm/README.md:25` and `src/withVRhythm.ts`, where `raw.preset in presets` falls back to `{}`.

## Evidence

`parameters: { vrhythm: { lineHeight: true, preset: 'nope' } }` on a `StoryObj` passes `tsc` on Storybook 10.6.6. The runtime fallback comes from reading the code and was not run.

## Impact

A preset typo gives a default 16px grid with no warning. Scope the claim to CSF Next, and consider a dev-time `console.warn` for unknown presets.
