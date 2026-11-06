---
"storybook-vrhythm": patch
---

`auditRhythm` and `expectRhythm` now throw `RhythmConfigError` instead of passing when `offset`, `lineHeight` or `tolerance` is not finite, when `tolerance` is negative or at least half of `lineHeight`, or when an edge or baseline cannot be measured. Numeric `lineHeight`, `lineWidth`, `offset`, `maxWidth`, `columnWidth` and `gutterWidth` values now mean pixels, so the overlay no longer drops or ignores them.
