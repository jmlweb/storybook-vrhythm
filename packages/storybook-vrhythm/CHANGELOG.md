# storybook-vrhythm

## 1.0.0-next.3

### Major Changes

- [#48](https://github.com/jmlweb/storybook-vrhythm/pull/48) [`3b89152`](https://github.com/jmlweb/storybook-vrhythm/commit/3b89152d3d40704c6f2630b03dd4f46ee8c3f2ff) Thanks [@jmlweb](https://github.com/jmlweb)! - Anchor the grid to the story root by default, through the new `anchor` option (`'story'`, `'page'` or a selector). The overlay and the audit now share one origin, so audits give the same result in `centered`, `padded` and `fullscreen` at any viewport height. The overlay also covers tall stories and follows resizes. Use `anchor: 'page'` for the previous origin. `container` is deprecated: it now acts as a selector anchor, and the overlay always stays on `body`. Docs pages always use `'page'`.

### Minor Changes

- [#48](https://github.com/jmlweb/storybook-vrhythm/pull/48) [`3b89152`](https://github.com/jmlweb/storybook-vrhythm/commit/3b89152d3d40704c6f2630b03dd4f46ee8c3f2ff) Thanks [@jmlweb](https://github.com/jmlweb)! - Add the `edges` and `anchor` audit options, group equal deltas in the failure message, end it with a fix hint, and add a stable `code` to audit errors (`RhythmErrorCode`).

- [#48](https://github.com/jmlweb/storybook-vrhythm/pull/48) [`7df7501`](https://github.com/jmlweb/storybook-vrhythm/commit/7df7501360e63de503eda39ddc0095c3b0c9185d) Thanks [@jmlweb](https://github.com/jmlweb)! - Ship an Agent Skill in `skills/`, and lead the README and `llms.txt` with the agent workflow.

- [#48](https://github.com/jmlweb/storybook-vrhythm/pull/48) [`3b89152`](https://github.com/jmlweb/storybook-vrhythm/commit/3b89152d3d40704c6f2630b03dd4f46ee8c3f2ff) Thanks [@jmlweb](https://github.com/jmlweb)! - Add `parameters.vrhythm.audit` (`'error'`, `'todo'`, `'off'`) and `auditOptions` to audit every story with no `play` function. `'error'` fails the story, so the result reaches Vitest and `@storybook/addon-mcp`.

### Patch Changes

- [#48](https://github.com/jmlweb/storybook-vrhythm/pull/48) [`e2401af`](https://github.com/jmlweb/storybook-vrhythm/commit/e2401afd4771435d3f8c5ae8be3085ab44496b78) Thanks [@jmlweb](https://github.com/jmlweb)! - Report a malformed `ignore` selector as a `RhythmConfigError` with the code `INVALID_SELECTOR`, instead of a raw `DOMException`.

- [#48](https://github.com/jmlweb/storybook-vrhythm/pull/48) [`3b89152`](https://github.com/jmlweb/storybook-vrhythm/commit/3b89152d3d40704c6f2630b03dd4f46ee8c3f2ff) Thanks [@jmlweb](https://github.com/jmlweb)! - Reject grids the audit cannot trust: an overlay with no area or outside `root`, and an unknown preset, which now also warns in the console. Clear stale styles from the reused overlay, so `maxWidth` no longer leaks into the next story.

## 1.0.0-next.2

### Minor Changes

- [#46](https://github.com/jmlweb/storybook-vrhythm/pull/46) [`8fe7537`](https://github.com/jmlweb/storybook-vrhythm/commit/8fe753746bbd80cd6efc1bfb34fe0111f8ac494f) Thanks [@jmlweb](https://github.com/jmlweb)! - Add `12px` and `32px` built-in presets. `material`, `tailwind` and `bootstrap` are now explicit aliases of `4px`, `4px` and `24px`, so they share the base preset's color. Add the `carbon` alias (`8px`). Export `presetAliases` and the `PresetAliasName` type. The toolbar labels aliases as "(alias of …)".

### Patch Changes

- [#43](https://github.com/jmlweb/storybook-vrhythm/pull/43) [`ee857f8`](https://github.com/jmlweb/storybook-vrhythm/commit/ee857f8da44495ea4f0ee827fdb4f46d83496779) Thanks [@jmlweb](https://github.com/jmlweb)! - `auditRhythm` and `expectRhythm` now throw `RhythmConfigError` instead of passing when `offset`, `lineHeight` or `tolerance` is not finite, when `tolerance` is negative or at least half of `lineHeight`, or when an edge or baseline cannot be measured. Numeric `lineHeight`, `lineWidth`, `offset`, `maxWidth`, `columnWidth` and `gutterWidth` values now mean pixels, so the overlay no longer drops or ignores them.

## 1.0.0-next.1

### Minor Changes

- [#40](https://github.com/jmlweb/storybook-vrhythm/pull/40) [`7e2e784`](https://github.com/jmlweb/storybook-vrhythm/commit/7e2e7848805368dd2ad595d4a0c78ead4cc7427b) Thanks [@jmlweb](https://github.com/jmlweb)! - Add `storybook-vrhythm/audit` with `auditRhythm` and `expectRhythm`. They measure elements against the baseline grid in a real browser and report exact pixel offsets, for use in `play` functions. The package now ships `llms.txt`.

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
