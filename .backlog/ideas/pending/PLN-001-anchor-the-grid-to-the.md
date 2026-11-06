---
id: PLN-001
title: Anchor the grid to the story root
status: pending
created: 2026-11-06
complexity: high
---

## Goal

Let the overlay and the audit share an origin at the story root instead of the viewport top, as the default or through an `anchor` option.

## Context

The overlay is `position: absolute` on `body`, so the grid starts at y=0 and stops at the viewport height. That causes the viewport-dependent audit result in `centered`, the missing grid on tall stories, and the broken `container` option. The audit already supports this origin: `expectRhythm(canvasElement, { offset: 0 })` passed with origin at the root top, but the overlay stayed at y=0.

## Approach

1. Add a way to resolve the anchor element after the story has rendered, since the decorator runs before `storyFn`.
2. Position the overlay against that element's document position and cover its full height, or the document's for `fullscreen`.
3. Keep it in sync when the element resizes or moves, without adding dependencies.
4. Make `resolveGrid` use the same origin, so picture and numbers agree.
5. Define Docs behaviour, with one anchor per story rather than one body-wide overlay.
6. Add `Audit.stories.tsx` coverage for `centered`, `padded`, `fullscreen` and tall stories at several viewport heights.

## Files to Modify

- `packages/storybook-vrhythm/src/withVRhythm.ts` — run placement after render
- `packages/storybook-vrhythm/src/utils.ts` — anchor resolution and placement
- `packages/storybook-vrhythm/src/getStyle.ts` — sizing no longer tied to `body`
- `packages/storybook-vrhythm/src/audit.ts` — shared origin
- `packages/storybook-vrhythm/src/types.ts` — new option, if it is an option
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — layout guidance
- `apps/react/src/stories/Audit.stories.tsx` — real layout coverage

## Risks & Considerations

- `DIV_ID` and `PARENT_SELECTOR` must not change, since consumers may depend on `#storybook-rhythm`.
- Do not append inside a framework root: `#storybook-root` lost the overlay in testing.
- All three apps and both registration paths must keep working.
- A changed default shifts the grid for existing users, so it belongs before `1.0.0`.

## Open Questions

- Should this be the new default, or an opt-in `anchor` option?
- In `fullscreen`, is the root the same as the page for every framework?
