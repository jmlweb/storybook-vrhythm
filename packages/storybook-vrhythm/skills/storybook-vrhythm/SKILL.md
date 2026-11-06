---
name: storybook-vrhythm
description: Puts Storybook components on a baseline grid and proves it with numbers. Use when asked to fix vertical rhythm, spacing or alignment to a grid (4px, 8px, 24px), to set up storybook-vrhythm, or to audit components against a grid. Works from measured pixel deltas, not screenshots.
---

# Vertical rhythm with storybook-vrhythm

The audit reports each off-grid edge with an exact pixel delta. Use those numbers. Do not judge a screenshot of the overlay.

## Set up

Skip any step the project already has. Check `package.json` and `.storybook/` first.

1. Install: `npx storybook add storybook-vrhythm@next`. The `next` tag is required: `latest` is 0.x and has no audit. It supports Storybook 10 and 11. Confirm that `node_modules/storybook-vrhythm/package.json` says `1.0.0-next.3` or later: older versions ignore the `audit` parameter, so a pass proves nothing.
2. Install a test runner if missing: `npx storybook add @storybook/addon-vitest`. The audit needs a real browser. jsdom has no layout.
3. Set the grid and turn on the audit inside the default-exported object in `.storybook/preview.ts`. A separate `export const parameters` next to `export default` is ignored.

```ts
const preview = {
  parameters: {
    vrhythm: { lineHeight: '8px', audit: 'error' },
  },
};

export default preview;
```

With `definePreview`, put the same `parameters` in its config and add `vrhythm()` to `addons`, importing it from `storybook-vrhythm`.

To scope the audit to one component, set `audit` in that component's `parameters` instead.

## Run

Use whichever is available:

- `@storybook/addon-mcp`: call the `test-run` tool with the stories you changed.
- Vitest: `npx vitest run path/to/Component.stories.tsx`.

## Fix loop

1. Take the first violation in the output.
2. Move that edge by `-delta` pixels. A `delta` of `-3` means the edge is 3px above the nearest grid line, so move it down 3px.
3. Rerun. Moving an edge shifts everything below it, so later deltas go stale, and on-grid edges can move off.
4. Repeat until it passes.

Prefer changes to padding, line-height and height in the component's own styles. Fix the design tokens when many edges share a delta and the tokens are the cause. Equal deltas are a pattern, not proof of a shared cause.

## Rules

- Do not raise `tolerance`, lower `lineHeight`, remove the audit or delete an assertion to get a pass.
- Add `data-vrhythm-ignore` only to elements that are off-grid on purpose, and tell the user why.
- `edges: ['top']` misses a wrong height. Use it for gradual adoption only, and say so.
- Text on a spacing grid fails `checks: ['baseline']` by design. Use it for type-driven grids only.

## Errors

Audit errors carry a stable `code`.

| `code` | Meaning | Action |
| --- | --- | --- |
| `OFF_GRID` | Edges are off the grid | Run the fix loop |
| `NOTHING_MEASURED` | `root` is empty, or there is no layout | Run in a real browser, and check that the story renders |
| `NO_GRID` | No overlay, and no `lineHeight` | Pass `lineHeight`, or register the addon |
| `UNKNOWN_PRESET` | `preset` names no preset | Fix the name |
| `ANCHOR_NOT_FOUND` | `anchor` selector matched nothing | Fix the selector |
| `UNUSABLE_OVERLAY` | Overlay has no area, or lies outside `root` | Check `offset`, `anchor` and `maxWidth` |
| `INVALID_LENGTH`, `INVALID_TOLERANCE`, `INVALID_EDGES`, `INVALID_SELECTOR` | Bad option | Fix the option |
| `UNMEASURABLE` | The environment cannot measure | Run in a real browser |

Full reference: `node_modules/storybook-vrhythm/llms.txt`.
