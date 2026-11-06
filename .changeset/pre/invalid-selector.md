---
'storybook-vrhythm': patch
---

Report a malformed `ignore` selector as a `RhythmConfigError` with the code `INVALID_SELECTOR`, instead of a raw `DOMException`.
