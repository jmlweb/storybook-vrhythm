# storybook-vrhythm

[![npm version][npm-badge]][npm]
[![License: MIT][license-badge]][license]
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/storybook-vrhythm)](https://bundlephobia.com/package/storybook-vrhythm)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.org/package/storybook-vrhythm)

> Baseline grid overlay for Storybook. See your vertical rhythm while you build.

![Vertical rhythm overlay example](https://raw.githubusercontent.com/jmlweb/storybook-vrhythm/master/storybook-vrhythm.jpg)

Stop guessing if your spacing is consistent. `storybook-vrhythm` draws a customizable baseline grid on top of your stories so you can **see** alignment issues as you develop — not after you ship.

## Features

- **Framework agnostic** — React, Vue, Angular, Svelte, Web Components, HTML
- **Toolbar toggle** — Show/hide the grid from Storybook's toolbar, no reload needed
- **Built-in presets** — Material, Tailwind, Bootstrap, and pixel-based grids ready to use
- **Column grids** — Optional vertical column overlay with configurable gutter width
- **Fully customizable** — Color, line height, line width, offset, opacity, z-index, max width
- **Lightweight** — Pure CSS overlay via `linear-gradient`. Zero runtime dependencies
- **Non-intrusive** — `pointer-events: none` keeps your stories fully interactive
- **TypeScript first** — Full type safety with Storybook parameter augmentation

## Requirements

- Node.js 22.12+
- Storybook 10 or 11

Storybook 10 is supported but not continuously tested: CI runs against Storybook 11 only.

## Quick start

```bash
pnpm add -D storybook-vrhythm
# or: npm install --save-dev storybook-vrhythm
```

Add to `.storybook/main.ts`:

```typescript
const config = {
  addons: ['storybook-vrhythm'],
};

export default config;
```

Done. A baseline grid overlay is now visible on every story, toggleable from the toolbar.

### CSF Next

Using `definePreview`? Register the addon in `.storybook/preview.ts` instead:

```typescript
import { definePreview } from '@storybook/your-framework';
import vrhythm from 'storybook-vrhythm';

export default definePreview({
  addons: [vrhythm()],
});
```

This gives `parameters.vrhythm` full type safety in your stories. It needs no entry in `.storybook/main.ts`, though keeping one is harmless: the decorator still runs once.

`definePreview` must come from your framework package. `@storybook/html` and `@storybook/html-vite` 11.0.0-beta.0 don't export it, so HTML projects should register the addon in `.storybook/main.ts`.

## Configuration

### Global defaults

Set defaults for all stories in `.storybook/preview.ts`:

```typescript
export const parameters = {
  vrhythm: {
    color: 'rgba(99, 102, 241, 0.2)',
    lineHeight: '8px',
  },
};
```

### Per-story overrides

```typescript
export const Compact = {
  parameters: {
    vrhythm: { lineHeight: '4px', color: 'rgba(244, 67, 54, 0.15)' },
  },
};

export const NoGrid = {
  parameters: {
    vrhythm: { hide: true },
  },
};
```

### Using presets

Skip manual configuration with built-in presets that match popular design systems:

```typescript
export const MaterialGrid = {
  parameters: {
    vrhythm: { preset: 'material' },
  },
};
```

| Preset      | Line height | Color                      | Best for                  |
| ----------- | ----------- | -------------------------- | ------------------------- |
| `4px`       | 4px         | `rgba(0, 150, 255, 0.15)`  | Dense UIs, compact grids  |
| `8px`       | 8px         | `rgba(0, 150, 255, 0.2)`   | Standard 8pt grid systems |
| `16px`      | 16px        | `rgba(204, 204, 204, 0.5)` | Body text baseline        |
| `24px`      | 24px        | `rgba(204, 204, 204, 0.5)` | Heading alignment         |
| `material`  | 4px         | `rgba(244, 67, 54, 0.15)`  | Material Design           |
| `tailwind`  | 4px         | `rgba(99, 102, 241, 0.15)` | Tailwind CSS              |
| `bootstrap` | 8px         | `rgba(13, 110, 253, 0.2)`  | Bootstrap                 |

### Column grid

Add vertical column lines on top of the horizontal baseline:

```typescript
export const ColumnGrid = {
  parameters: {
    vrhythm: {
      lineHeight: '8px',
      columnWidth: '80px',
      gutterWidth: '16px',
      columnColor: 'rgba(99, 102, 241, 0.1)',
    },
  },
};
```

### Manual decorator

If you prefer to opt out of the addon preset:

```typescript
import { withVRhythm } from 'storybook-vrhythm';

export const decorators = [withVRhythm];
```

## Options

### Style options

| Option        | Type               | Default                | Description                                        |
| ------------- | ------------------ | ---------------------- | -------------------------------------------------- |
| `color`       | `string`           | `'rgb(204, 204, 204)'` | CSS color for horizontal guide lines               |
| `lineHeight`  | `string \| number` | `'16px'`               | Baseline grid height (`'8px'`, `'1rem'`, etc.)     |
| `lineWidth`   | `string \| number` | `'1px'`                | Thickness of each horizontal guide line            |
| `offset`      | `string \| number` | `0`                    | Vertical offset from the top of the container      |
| `opacity`     | `number`           | `1`                    | Overlay opacity (0–1)                              |
| `zIndex`      | `number`           | `9999`                 | Stack order of the overlay                         |
| `maxWidth`    | `string \| number` | —                      | Centers the overlay with this max width            |
| `columnWidth` | `string \| number` | —                      | Repeating column width for a vertical column grid  |
| `columnColor` | `string`           | —                      | CSS color for column lines (falls back to `color`) |
| `gutterWidth` | `string \| number` | —                      | Gutter between columns (requires `columnWidth`)    |

### Config options

| Option      | Type      | Default | Description                                                        |
| ----------- | --------- | ------- | ------------------------------------------------------------------ |
| `hide`      | `boolean` | `false` | Hide the overlay for this story (overrides toolbar toggle)         |
| `preset`    | `string`  | —       | Built-in preset name (see table above)                             |
| `container` | `string`  | —       | CSS selector for the overlay's parent element (defaults to `body`) |

### Parameter resolution order

```text
DEFAULT_PARAMS → preset styles → story-level parameters
```

Later sources override earlier ones. The story-level `hide` param takes precedence over the toolbar toggle.

## Why vertical rhythm?

Vertical rhythm is the practice of aligning elements to a consistent baseline grid. When text, images, and components share the same vertical cadence, layouts feel cohesive and polished — even if users can't articulate why.

This addon makes the invisible grid visible during development, so spacing inconsistencies get caught in Storybook instead of production.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/jmlweb/storybook-vrhythm/blob/master/CONTRIBUTING.md) for the setup, or open an [issue](https://github.com/jmlweb/storybook-vrhythm/issues).

## Inspiration

[Baseliner](https://jpedroribeiro.com/2015/08/baseliner-my-first-chrome-extension/) — a Chrome extension by JP Ribeiro for overlaying baseline grids.

## License

[MIT](https://github.com/jmlweb/storybook-vrhythm/blob/master/LICENSE)

[npm-badge]: https://img.shields.io/npm/v/storybook-vrhythm.svg
[npm]: https://www.npmjs.org/package/storybook-vrhythm
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/jmlweb/storybook-vrhythm/blob/master/LICENSE
