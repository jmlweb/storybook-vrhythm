# storybook-vrhythm

[![npm version][npm-badge]][npm]
[![License: MIT][license-badge]][license]
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/storybook-vrhythm)](https://bundlephobia.com/package/storybook-vrhythm)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.org/package/storybook-vrhythm)

> Baseline grid overlay for Storybook. See your vertical rhythm while you build.

![Vertical rhythm overlay example](https://raw.githubusercontent.com/jmlweb/storybook-vrhythm/main/storybook-vrhythm.jpg)

Stop guessing if your spacing is consistent. `storybook-vrhythm` measures your stories against a baseline grid and draws that grid on top of them, so agents and tests get exact pixel offsets, and you can **see** alignment issues as you develop.

## Use it with a coding agent

This is the fastest way to use the addon. Coding agents such as Claude Code, Cursor and Copilot can't judge a screenshot of a grid, so `storybook-vrhythm` gives them numbers: each off-grid edge, how far off it is, and which way to move it.

### Set up in one prompt

Copy this into your agent:

```text
Put <Component> on a <8px> baseline grid with storybook-vrhythm.

1. Read https://raw.githubusercontent.com/jmlweb/storybook-vrhythm/main/packages/storybook-vrhythm/llms.txt, or node_modules/storybook-vrhythm/llms.txt if it is installed.
2. Install it with `npx storybook add storybook-vrhythm@next` and set `vrhythm: { lineHeight: '<8px>', audit: 'error' }` in the story's parameters.
3. Run that story's tests in a real browser.
4. Fix violations from the top: move each reported edge by -delta pixels, rerun after every change, and repeat until it passes.
5. Add data-vrhythm-ignore only to elements that are off-grid on purpose, and say why. Do not raise tolerance, lower lineHeight or remove the audit to get a pass.

Report what you changed and the final result.
```

### Or give the agent a skill

The package ships an [Agent Skill](https://github.com/jmlweb/storybook-vrhythm/tree/main/packages/storybook-vrhythm/skills/storybook-vrhythm) at `node_modules/storybook-vrhythm/skills/`. It teaches the setup, the fix loop, the error codes and the rules against silencing the audit. Copy it to your agent's skills folder.

### Set it up by hand

```bash
npx storybook add storybook-vrhythm@next
npx storybook add @storybook/addon-vitest # if you have no story tests yet
```

Install `@next` even on Storybook 10: the `latest` tag is 0.x and has no audit. The `audit` parameter needs `1.0.0-next.3` or later: older versions ignore it, so nothing fails.

Audit every story from `.storybook/preview.ts`, with no `play` functions to write:

```typescript
const preview = {
  parameters: {
    vrhythm: { lineHeight: '8px', audit: 'error' },
  },
};

export default preview;
```

An off-grid story now fails, and the failure tells the agent what to do:

```text
Expected elements on the 8px grid starting at y=0px, found 1 off-grid:
  button.storybook-button bottom: 36px, nearest 40px (delta -4px)
Fix from the top: move button.storybook-button bottom by 4px, then rerun. Moving an edge shifts everything below it, so later deltas go stale.
```

### Run it through MCP

With [`@storybook/addon-mcp`](https://github.com/storybookjs/mcp), an agent can run tests without a shell:

```bash
npx storybook add @storybook/addon-mcp
```

Connect the agent to `http://localhost:6006/mcp` and have it call the `test-run` tool. Audit failures with `audit: 'error'` appear under `Failing Stories`, with the same text as above.

### Adopt it gradually

On an existing design system, tighten in steps:

1. `audit: 'todo'` warns in the console and fails nothing.
2. `audit: 'error'` with `auditOptions: { edges: ['top'] }` holds new work to the grid on top edges. It misses a wrong height.
3. `audit: 'error'` with the default edges is the full check.

Set `audit` per component to move one at a time.

## Features

- **Built for coding agents** — One parameter audits every story. Failures name the edge, the delta and the fix, through Vitest or MCP
- **Rhythm audit** — Assert grid alignment in `play` functions, with exact pixel offsets in the failure
- **Same result everywhere** — The grid starts at the story root, so `centered`, `padded` and `fullscreen` stories give the same answer at any viewport height
- **Agent skill and `llms.txt`** — Ship with the package
- **Framework agnostic** — React, Vue, Angular, Svelte, Web Components, HTML
- **Toolbar toggle** — Show/hide the grid from Storybook's toolbar, no reload needed
- **Built-in presets** — pixel-based grids plus Material, Tailwind, Bootstrap, and Carbon aliases ready to use
- **Column grids** — Optional vertical column overlay with configurable gutter width
- **Fully customizable** — Color, line height, line width, offset, opacity, z-index, max width
- **Lightweight** — Pure CSS overlay via `linear-gradient`. Zero runtime dependencies
- **Non-intrusive** — `pointer-events: none` keeps your stories fully interactive
- **TypeScript first** — Typed parameters under CSF Next, and editor completion for presets

## Requirements

- Node.js 22.12+
- Storybook 10 or 11

CI runs the unit and browser tests against both.

**Install the `next` tag**, on Storybook 10 or 11: `pnpm add -D storybook-vrhythm@next`. The `latest` tag is 0.x. It supports Storybook 10 only and has no audit, so `storybook-vrhythm/audit` will not resolve. `next` moves to `latest` as `1.0.0` when Storybook 11 is released.

## Quick start

```bash
npx storybook add storybook-vrhythm@next
```

That installs the addon and registers it. To do it by hand, install the package and add it to `.storybook/main.ts`:

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
const preview = {
  parameters: {
    vrhythm: {
      color: 'rgba(99, 102, 241, 0.2)',
      lineHeight: '8px',
    },
  },
};

export default preview;
```

Put `parameters` inside the default export. A separate `export const parameters` next to `export default preview` is ignored, with no error. With `definePreview`, put it in the object you pass to `definePreview`.

### Off by default

The grid shows on every story after install. To keep it off until someone picks it in the toolbar, set `initialGlobals`:

```typescript
const preview = {
  initialGlobals: { vrhythm: 'false' },
};

export default preview;
```

This also keeps the grid out of visual regression tests such as Chromatic. The audit still runs: with `audit` set, it reads the grid from the story's parameters.

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
| `12px`      | 12px        | `rgba(0, 150, 255, 0.2)`   | 12px grids, mid-density UIs |
| `16px`      | 16px        | `rgba(204, 204, 204, 0.5)` | Body text baseline        |
| `24px`      | 24px        | `rgba(204, 204, 204, 0.5)` | Heading alignment         |
| `32px`      | 32px        | `rgba(204, 204, 204, 0.5)` | Large-scale layout grids  |

**Aliases.** These names add no style of their own. Each one is exactly the base preset shown, under a name you may recognize from a design system:

| Alias       | Same as | Reason                                    |
| ----------- | ------- | ----------------------------------------- |
| `material`  | `4px`   | Material Design uses a 4dp grid           |
| `tailwind`  | `4px`   | Tailwind's spacing unit is 0.25rem        |
| `bootstrap` | `24px`  | Body text is 1rem × 1.5 line-height       |
| `carbon`    | `8px`   | IBM Carbon uses an 8px mini-unit          |

### Grid origin

The first grid line starts at the story root, plus `offset`. The overlay and the audit share that origin, so the picture and the numbers always agree. Set `anchor` to change it:

| `anchor`     | First grid line                                        |
| ------------ | ------------------------------------------------------ |
| `'story'`    | Top of the story root (default)                        |
| `'page'`     | Top of the document                                    |
| Any selector | Top of that element, looked up after the story renders |

The overlay stays on `body`, runs to the end of the document and spans its full width. It follows the anchor when the story or window resizes.

Docs pages always use `'page'`: they show several stories but one overlay, styled by the story that rendered last.

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

const preview = {
  decorators: [withVRhythm],
};

export default preview;
```

The `audit` parameter needs the addon: the manual decorator only draws the grid. `expectRhythm` and `auditRhythm` work either way.

## Options

### Style options

| Option        | Type               | Default                | Description                                        |
| ------------- | ------------------ | ---------------------- | -------------------------------------------------- |
| `color`       | `string`           | `'rgb(204, 204, 204)'` | CSS color for horizontal guide lines               |
| `lineHeight`  | `string \| number` | `'16px'`               | Baseline grid height (`'8px'`, `'1rem'`, etc.)     |
| `lineWidth`   | `string \| number` | `'1px'`                | Thickness of each horizontal guide line            |
| `offset`      | `string \| number` | `0`                    | Vertical offset from the anchor                    |
| `opacity`     | `number`           | `1`                    | Overlay opacity (0–1)                              |
| `zIndex`      | `number`           | `9999`                 | Stack order of the overlay                         |
| `maxWidth`    | `string \| number` | —                      | Centers the overlay with this max width            |
| `columnWidth` | `string \| number` | —                      | Repeating column width for a vertical column grid  |
| `columnColor` | `string`           | —                      | CSS color for column lines (falls back to `color`) |
| `gutterWidth` | `string \| number` | —                      | Gutter between columns (requires `columnWidth`)    |

### Config options

| Option         | Type                           | Default   | Description                                                          |
| -------------- | ------------------------------ | --------- | -------------------------------------------------------------------- |
| `audit`        | `'error' \| 'todo' \| 'off'`   | `'off'`   | Audit the story after it renders and after `play`                    |
| `auditOptions` | `AuditOptions`                 | —         | Options for that audit, as in [the audit](#auditing-rhythm-in-tests) |
| `anchor`       | `'story' \| 'page' \| string`  | `'story'` | Where the first grid line starts (see [Grid origin](#grid-origin))   |
| `hide`         | `boolean`                      | `false`   | Hide the overlay for this story (overrides toolbar toggle)           |
| `preset`       | `string`                       | —         | Built-in preset name (see table above)                               |
| `container`    | `string`                       | —         | Deprecated: use `anchor`, which takes the same selector              |

An unknown `preset` warns in the console and falls back to the default grid. The audit rejects that grid with `UNKNOWN_PRESET`.

`parameters.vrhythm` is type-checked when you register through `definePreview`. With `addons: ['storybook-vrhythm']`, `StoryObj` does not check it.

### Parameter resolution order

```text
DEFAULT_PARAMS → preset styles → story-level parameters → toolbar preset
```

Later sources override earlier ones, so a preset picked in the toolbar also changes the grid the audit reads from the overlay. The story-level `hide` param takes precedence over the toolbar toggle.

## Auditing rhythm in tests

The overlay shows the grid to people. `storybook-vrhythm/audit` measures it, so tests, CI and coding agents get numbers instead of a picture. See [Use it with a coding agent](#use-it-with-a-coding-agent) for a ready-made prompt.

To audit every story, set `audit: 'error'` in `parameters.vrhythm`. Use the functions below for one story, or for the data.

```ts
import { expectRhythm } from 'storybook-vrhythm/audit';

export const Card = {
  play: async ({ canvasElement }) => {
    await expectRhythm(canvasElement);
  },
};
```

`expectRhythm` throws when an element is off the grid:

```text
Expected elements on the 8px grid starting at y=0px, found 1 off-grid:
  h2.title top: 21px, nearest 24px (delta -3px)
Fix from the top: move h2.title top by 3px, then rerun. Moving an edge shifts everything below it, so later deltas go stale.
```

Violations with the same `delta` are listed together. That is a pattern, not proof of a shared cause. The message shows 10 violations at most. `error.report.violations` always has all of them.

Use `auditRhythm` to get the result as data:

```ts
import { auditRhythm } from 'storybook-vrhythm/audit';

const report = await auditRhythm(canvasElement);
// {
//   ok: false,
//   grid: { lineHeight: 8, origin: 0 },
//   checked: 12,
//   violations: [
//     { selector: 'h2.title', edge: 'top', actual: 21, nearest: 24, delta: -3 },
//   ],
// }
```

`grid.origin` is the viewport Y of the first grid line. `actual` and `nearest` are relative to it. It comes from the overlay's top, or from the top of `root` plus `offset` when `offset` is set or the overlay is hidden. `checked` counts what was measured after `checks`, `edges` and `ignore` apply, so `0` means nothing was tested.

Options for both functions:

| Option       | Type                      | Default          | Description                                                            |
| ------------ | ------------------------- | ---------------- | ---------------------------------------------------------------------- |
| `lineHeight` | `string \| number`        | From the overlay | Grid size in `px`, `rem`, or a number of pixels                        |
| `offset`     | `string \| number`        | Overlay position | Grid start below the top of `root`, or of `anchor`. Replaces the overlay's position, and differs from the story's `offset`, which starts at the story's anchor |
| `anchor`     | `'story' \| 'page' \| string` | `root`        | What `offset` is measured from. Replaces the overlay's position        |
| `tolerance`  | `number`                  | `0.5`            | Allowed distance from a grid line, in pixels                           |
| `checks`     | `('box' \| 'baseline')[]` | `['box']`        | What to measure                                                        |
| `edges`      | `('top' \| 'bottom')[]`    | Both             | Box edges to measure. `['top']` misses a wrong height                  |
| `ignore`     | `string`                  | —                | Selector to skip, on top of `[data-vrhythm-ignore]`                    |

- **`box`** checks the top and bottom of each visible element, except the `root` itself, inline text elements and inline `svg`. It suits spacing grids such as 4px and 8px.
- **`baseline`** checks each line of text. It suits type-driven grids. Don't use it on a spacing grid: 16px text in a 24px line sits about 17px below an on-grid box. Results can differ by up to 1px, and more with `font-stretch` or `font-size-adjust`, so raise `tolerance` up to 1, only for font-metric drift, and say why.
- **Invalid setups throw:** `RhythmConfigError` means the audit could not give a real answer. See [Error codes](#error-codes).
- **Fixing violations:** work from the top down and rerun after each change. Moving an edge shifts everything below it, so `delta` values further down go stale, and on-grid edges can move off.
- **Off-grid on purpose?** Add `data-vrhythm-ignore` to skip an element and everything inside it. Use it when the component owns the decision. Use the `ignore` option, which also skips subtrees, to exclude something for one story or without touching markup.
- **Real layout required:** run it in a browser, such as `@storybook/addon-vitest` with Playwright. jsdom has no layout, so `expectRhythm` fails there with `Nothing was measured`.
- **Hidden overlay:** `audit` needs nothing extra: it uses the grid the overlay would have drawn. `expectRhythm` and `auditRhythm` need `lineHeight` from you, and the origin is the top of `root` unless you pass `anchor` or `offset`.
- **`audit` and empty stories:** `audit: 'error'` fails with `NOTHING_MEASURED` when nothing was measured, as `expectRhythm` does. Set `audit: 'off'` on stories that render outside the canvas, such as portals. `audit: 'todo'` never fails a story: it warns about off-grid edges and bad setups alike.
- **Nested scrolling:** the overlay runs to the end of the document. Content that scrolls inside its own container has no grid past the first screen. The audit is not affected.
- **Any layout:** `centered`, `padded` and `fullscreen` give the same result at any viewport height, because the grid starts at the story root. `anchor: 'page'` gives that up: `centered` then depends on viewport height.
- **Top margins:** a top margin on the first element collapses through the root and moves it, and the grid with it. That margin is not measured.

### Error codes

Audit errors have a stable `code`, also exported as `RhythmErrorCode`. Branch on it, not on the message.

| `code`              | Error                  | Meaning                                                                                     |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| `OFF_GRID`          | `RhythmAssertionError` | Edges are off the grid                                                                      |
| `NOTHING_MEASURED`  | `RhythmAssertionError` | `checked` is `0`: `root` is empty, or there is no layout                                    |
| `NO_GRID`           | `RhythmConfigError`    | No overlay and no `lineHeight` option                                                       |
| `UNKNOWN_PRESET`    | `RhythmConfigError`    | `preset` names no preset, so the overlay's grid is not the one you asked for                |
| `ANCHOR_NOT_FOUND`  | `RhythmConfigError`    | The `anchor` selector matched nothing                                                       |
| `UNUSABLE_OVERLAY`  | `RhythmConfigError`    | The overlay has no area or lies outside `root`, so it is not a grid                         |
| `INVALID_LENGTH`    | `RhythmConfigError`    | `lineHeight` or `offset` is not a finite `px` or `rem` length, or `lineHeight` is 0 or less |
| `INVALID_TOLERANCE` | `RhythmConfigError`    | `tolerance` is negative, not finite, or half of `lineHeight` or more                        |
| `INVALID_EDGES`     | `RhythmConfigError`    | `edges` is empty                                                                            |
| `INVALID_SELECTOR`  | `RhythmConfigError`    | `ignore` is not a valid selector                                                            |
| `INVALID_AUDIT_MODE` | `RhythmConfigError`   | `parameters.vrhythm.audit` is not `'error'`, `'todo'` or `'off'`                            |
| `UNMEASURABLE`      | `RhythmConfigError`    | The environment cannot measure an edge or a baseline                                        |

## Why vertical rhythm?

Vertical rhythm is the practice of aligning elements to a consistent baseline grid. When text, images, and components share the same vertical cadence, layouts feel cohesive and polished — even if users can't articulate why.

This addon makes the invisible grid visible during development, so spacing inconsistencies get caught in Storybook instead of production.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/jmlweb/storybook-vrhythm/blob/main/CONTRIBUTING.md) for the setup, or open an [issue](https://github.com/jmlweb/storybook-vrhythm/issues).

## Inspiration

[Baseliner](https://jpedroribeiro.com/2015/08/baseliner-my-first-chrome-extension/) — a Chrome extension by JP Ribeiro for overlaying baseline grids.

## License

[MIT](https://github.com/jmlweb/storybook-vrhythm/blob/main/LICENSE)

[npm-badge]: https://img.shields.io/npm/v/storybook-vrhythm.svg
[npm]: https://www.npmjs.org/package/storybook-vrhythm
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/jmlweb/storybook-vrhythm/blob/main/LICENSE
