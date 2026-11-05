# storybook-vrhythm

## 1.0.0-next.0

### Major Changes

- [#37](https://github.com/jmlweb/storybook-vrhythm/pull/37) [`1cfc56e`](https://github.com/jmlweb/storybook-vrhythm/commit/1cfc56ec918f3a89a2c9d81ee0ce92b1fdb4d7b6) Thanks [@jmlweb](https://github.com/jmlweb)! - Add Storybook 11 support alongside Storybook 10. The `storybook` peer range is now `^10.0.0 || ^11.0.0-0`.
  
  The package now has a default export for CSF Next. Register it with `definePreview({ addons: [vrhythm()] })`. Registering the addon in `.storybook/main.ts` and using the named `withVRhythm` decorator both keep working.
  
  **Breaking:** require Node 22.12 or later, the minimum for Storybook 11.

### Patch Changes

- [#38](https://github.com/jmlweb/storybook-vrhythm/pull/38) [`e92de84`](https://github.com/jmlweb/storybook-vrhythm/commit/e92de84bebd0bf03664d148c00fca9d90b2b7ac2) Thanks [@jmlweb](https://github.com/jmlweb)! - Ship the `LICENSE` file and mark the package as `sideEffects: false`. `index` and `preview` now share one chunk, so the decorator is no longer bundled twice. Remove the root `preset.js`, which `exports` already made unreachable.

## 0.5.0

### Minor Changes

- [#32](https://github.com/jmlweb/storybook-vrhythm/pull/32) [`4e92dd2`](https://github.com/jmlweb/storybook-vrhythm/commit/4e92dd2341e651b964cb54cfa15762c7a1be0678) Thanks [@jmlweb](https://github.com/jmlweb)! - **Breaking:** require Node 22 or later. `engines.node` is now `>=22`, because Node 20 reached end of life on 2026-04-30. Ships as a minor bump because the package is still 0.x. The addon's API and the `storybook` peer range are unchanged.

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
