---
'storybook-vrhythm': major
---

Anchor the grid to the story root by default, through the new `anchor` option (`'story'`, `'page'` or a selector). The overlay and the audit now share one origin, so audits give the same result in `centered`, `padded` and `fullscreen` at any viewport height. The overlay also covers tall stories and follows resizes. Use `anchor: 'page'` for the previous origin. `container` is deprecated: it now acts as a selector anchor, and the overlay always stays on `body`. Docs pages always use `'page'`.
