---
id: PLN-004
title: Publish a live demo and sharpen the repo listing
status: pending
created: 2026-11-06
complexity: low
---

## Goal

Let someone evaluate the addon in under a minute, including the audit.

## Context

There is no hosted Storybook. The README image shows the overlay but not a failing audit, which is the differentiator, since core Storybook has its own configurable grid. GitHub has no topics or homepage, and its description still says "Storybook Vertical Rhythm Decorator".

## Approach

1. Prerequisite (manual, by the maintainer): enable GitHub Pages for the repo. `gh api repos/jmlweb/storybook-vrhythm/pages` returns 404 today.
2. Deploy the `apps/react` Storybook from CI to Pages. `ci.yml` already runs `turbo run build-storybook`, so reuse that build. The new workflow needs `pages: write` and `id-token: write`, and must pin actions by SHA like `ci.yml` does.
3. Keep the demo to `fullscreen` stories until TSK-010 lands (it covers TSK-002, tall stories, and TSK-003, centered layout). Otherwise the demo shows those bugs. The `audit/` stories set `layout: 'fullscreen'`, while `Options.stories.tsx` and `Showcase.stories.tsx` use `padded`, so either set it there or filter the demo build to chosen stories.
4. Decide whether test fixtures such as `HiddenOverlayNeedsOptions` appear in the demo. Deploying all of `apps/react` exposes them.
5. Add a demo story that is off-grid on purpose and renders the `auditRhythm` report on screen. Assert the failure the way `OffGrid` does (`Showcase.stories.tsx`), so the story passes in `pnpm -F @apps/react test` and needs no test exclusion. Do not use `tags: ['!test']`: `scripts/run-story-tests.mjs` matches the text of the whole file, so it would exempt that file from the no-tests guard.
6. Add the demo link and the failing audit output near the top of the README, plus a short comparison with the core grid: baseline lines plus numeric checks.
7. Update the `homepage` field in `packages/storybook-vrhythm/package.json` together with the README link. It reaches npm only at the next publish: `next.2` at the earliest, and `latest` at GA.

## Files to Modify

- `.github/workflows/` — new demo deploy workflow
- `apps/react/src/stories/` — demo story that renders the audit report; `layout` in `Options.stories.tsx`, if that route is chosen
- `packages/storybook-vrhythm/README.md` — demo link, audit output, comparison
- `packages/storybook-vrhythm/package.json` — `homepage`

## Manual checklist (maintainer, not task criteria)

- Enable GitHub Pages.
- Run `gh repo edit` to set the description (it still says "Storybook Vertical Rhythm Decorator"), topics and homepage. This changes the public listing.

## Risks & Considerations

- A hosted story that throws may show as a broken page instead of a clear audit failure (unverified). Rendering the report avoids this.
- The demo uses Storybook 11 beta while `latest` targets Storybook 10.
- The README image links to `raw.githubusercontent.com/.../main/`, so link and metadata changes should land together.

## Revision History

- [2026-11-06] Added the Pages prerequisite and permissions, SHA pinning, `fullscreen`-only demo until TSK-002 and TSK-003 land, a story exclusion mechanism, the `homepage` field, and a manual checklist for the listing.
- [2026-11-06] Replaced the excluded failing story with a passing story that renders the report; defined how the demo stays on `fullscreen` stories; pointed to TSK-010; added the test-fixtures decision and the `homepage` publish timing.
