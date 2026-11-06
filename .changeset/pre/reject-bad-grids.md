---
'storybook-vrhythm': patch
---

Reject grids the audit cannot trust: an overlay with no area or outside `root`, and an unknown preset, which now also warns in the console. Clear stale styles from the reused overlay, so `maxWidth` no longer leaks into the next story.
