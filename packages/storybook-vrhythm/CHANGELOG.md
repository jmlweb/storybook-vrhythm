# storybook-vrhythm

## 0.4.0

### Minor Changes

- [`e1c1e0f`](https://github.com/jmlweb/storybook-vrhythm/commit/e1c1e0fe30ca52bdbc604089419db070d4ce7192) Thanks [@jmlweb](https://github.com/jmlweb)! - Add `lineWidth`, `maxWidth`, `gutterWidth` style params and toolbar preset selector.

  - `lineWidth`: configurable line thickness for horizontal and column grid lines (replaces hardcoded `1px`)
  - `maxWidth`: constrains overlay width and centers it horizontally within the parent
  - `gutterWidth`: renders a gutter band between columns instead of a thin line (requires `columnWidth`)
  - Toolbar now lists all built-in presets as selectable items, allowing preset switching without touching story code; selected global preset overrides story-level style params

### Patch Changes

- [`7b1ea58`](https://github.com/jmlweb/storybook-vrhythm/commit/7b1ea582b5a252f9b412a0b2682da0aa9b1e98d7) Thanks [@jmlweb](https://github.com/jmlweb)! - Fix column gradient height (was 1px, now 100%) and allow overlay to move when container changes between stories. Invalid container selectors now fall back to body instead of crashing.

## 0.3.0

### Minor Changes

- [`8338727`](https://github.com/jmlweb/storybook-vrhythm/commit/8338727d6c4b4ee7d510a8e3c5a2d477f55b0062) Thanks [@jmlweb](https://github.com/jmlweb)! - Story-level `hide` parameter now takes precedence over the toolbar toggle. This ensures author intent wins over interactive toggle state.
