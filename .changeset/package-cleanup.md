---
"storybook-vrhythm": patch
---

Ship the `LICENSE` file and mark the package as `sideEffects: false`. `index` and `preview` now share one chunk, so the decorator is no longer bundled twice. Remove the root `preset.js`, which `exports` already made unreachable.
