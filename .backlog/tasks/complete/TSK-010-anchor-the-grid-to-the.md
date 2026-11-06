---
id: TSK-010
title: Anchor the grid to the story root
status: complete
priority: P2
tags: []
created: 2026-11-06
source: idea/PLN-001
depends-on: []
completed: 2026-11-06
started: 2026-11-06
---

# Anchor the grid to the story root

## Description

### Goal

Let the overlay and the audit share an origin at the story root instead of the viewport top, as the default or through an `anchor` option.

### Context

The overlay is `position: absolute` on `body`, so the grid starts at y=0 and stops at the viewport height. That causes the viewport-dependent audit result in `centered`, the missing grid on tall stories, and the broken `container` option. The audit already supports this origin: `expectRhythm(canvasElement, { offset: 0 })` passed with origin at the root top, but the overlay stayed at y=0.

### Approach

1. Ship the anchor as an opt-in `anchor` option first. Leave the default unchanged, so no existing grid moves. Decide the default separately, before `1.0.0` GA. Settle the value shape of `anchor` (selector string, element, or a keyword) as the first step.
2. Place the overlay after the story renders. The decorator runs before `storyFn`, so use a hook such as `useEffect` from `storybook/preview-api`. Prove it works in `apps/react`, `apps/vue` and `apps/html`, and on both registration paths.
3. Position the overlay against the anchor's document position and cover its full height, or the document's for `fullscreen`.
4. Keep it in sync when the element resizes or moves, without adding dependencies. `ResizeObserver` fits, but jsdom lacks it, so unit tests need a stub.
5. Make `resolveGrid` use the same origin, so picture and numbers agree.
6. Docs: keep one `#storybook-rhythm` element, because `audit.ts` finds the overlay with `getElementById(DIV_ID)`. Define which story's anchor it follows in Docs, and record that rule in the README.
7. Add `Audit.stories.tsx` coverage for `centered`, `padded`, `fullscreen` and tall stories at several viewport heights. Today the file has only `layout: 'fullscreen'` stories.
8. Add unit tests in `test/utils.test.ts` and `test/audit.test.ts`.
9. Add a changeset and update the module notes in `AGENTS.md`.

### Risks & Considerations

- `DIV_ID` and `PARENT_SELECTOR` must not change, since consumers may depend on `#storybook-rhythm`.
- Do not append inside a framework root: `#storybook-root` lost the overlay in testing (React only; the cause is unconfirmed).
- Hook-based placement may flash the grid at the old position for one frame.
- All three apps and both registration paths must keep working.
- Making `anchor` the default later shifts the grid for existing users, so decide it before `1.0.0` GA.

### Overlapping tasks

This task would close TSK-002, TSK-003 and TSK-006. Decide which route owns them before starting.

### Open Questions

- Should `anchor` become the default at `1.0.0` GA?
- In `fullscreen`, is the root the same as the page for every framework?

## Acceptance Criteria

- [x] `anchor` option ships opt-in with its value shape defined; default behavior is unchanged — evidence: anchor ships as the default, by user decision, overriding the opt-in plan. anchor page restores the previous origin (2026-11-07) (2026-11-06)
- [x] Overlay is placed after story render and works in apps/react, apps/vue and apps/html on both registration paths — evidence: Placed by ResizeObserver, not useEffect, which fires after play. manual: React, Vue CSF Next, HTML classic overlay top equals root top (2026-11-07) (2026-11-06)
- [x] Overlay is positioned against the anchor document position and covers its full height, or the document height for fullscreen — evidence: manual: Playwright measurements; TallStory (2026-11-07) (2026-11-06)
- [x] Overlay stays in sync when the anchor resizes or moves, with no new dependencies — evidence: OverlayFollowsResize, pnpm -F @apps/react test → 37 passed (2026-11-07) (2026-11-06)
- [x] resolveGrid uses the same origin as the overlay — evidence: prepare step in auditRhythm syncs the overlay before reading it; OriginFollowsTheStoryRoot (2026-11-07) (2026-11-06)
- [x] Docs keep one #storybook-rhythm element and the README records which story anchor it follows — evidence: README Grid origin: Docs always uses page (2026-11-07) (2026-11-06)
- [x] Audit.stories.tsx covers centered, padded, fullscreen and tall stories at several viewport heights — evidence: Audit.stories.tsx uses body padding as a stand-in because Vitest does not apply layouts, pnpm -F @apps/react test → 37 passed; real layouts checked with Playwright at four heights (2026-11-07) (2026-11-06)
- [x] Unit tests added in test/utils.test.ts and test/audit.test.ts — evidence: test/utils.test.ts and test/audit.test.ts, pnpm -F storybook-vrhythm test → 149 passed (2026-11-07) (2026-11-06)
- [x] Changeset added and AGENTS.md module notes updated — evidence: .changeset/anchor-grid-to-story.md and AGENTS.md (2026-11-07) (2026-11-06)

## Notes

## Learnings

- LRN-001: Storybook decorator hooks fire after play
- LRN-002: Failed reports do not reach Vitest or addon-mcp
- LRN-003: A first child top margin moves the story root
- LRN-004: Published addon-mcp tool names differ from source constants
## Progress Log

- [2026-11-06] Created
- [2026-11-06] Closes the open question: anchor is the default.
- [2026-11-06] Completed