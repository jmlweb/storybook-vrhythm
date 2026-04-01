---
"storybook-vrhythm": minor
---

Add `lineWidth`, `maxWidth`, `gutterWidth` style params and toolbar preset selector.

- `lineWidth`: configurable line thickness for horizontal and column grid lines (replaces hardcoded `1px`)
- `maxWidth`: constrains overlay width and centers it horizontally within the parent
- `gutterWidth`: renders a gutter band between columns instead of a thin line (requires `columnWidth`)
- Toolbar now lists all built-in presets as selectable items, allowing preset switching without touching story code; selected global preset overrides story-level style params
