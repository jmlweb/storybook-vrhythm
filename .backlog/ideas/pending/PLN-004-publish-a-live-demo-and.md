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
3. Build the demo from `fullscreen` stories until TSK-002 (tall stories) and TSK-003 (centered layout) land. Otherwise the demo shows those bugs.
4. Add a story with a deliberately failing audit, and keep it out of `pnpm -F @apps/react test`. Check how `apps/react` filters stories (for example a tag exclusion) before choosing the mechanism.
5. Add the demo link and the failing audit output near the top of the README, plus a short comparison with the core grid: baseline lines plus numeric checks.
6. Update the `homepage` field in `packages/storybook-vrhythm/package.json` together with the README link.

## Files to Modify

- `.github/workflows/` — new demo deploy workflow
- `apps/react/src/stories/` — failing-audit demo story, excluded from tests
- `packages/storybook-vrhythm/README.md` — demo link, audit output, comparison
- `packages/storybook-vrhythm/package.json` — `homepage`

## Manual checklist (maintainer, not task criteria)

- Enable GitHub Pages.
- Run `gh repo edit` to set the description (it still says "Storybook Vertical Rhythm Decorator"), topics and homepage. This changes the public listing.

## Risks & Considerations

- A failing audit story must not break the app's test run, which the repo guards by vitest results.
- The demo uses Storybook 11 beta while `latest` targets Storybook 10.
- The README image links to `raw.githubusercontent.com/.../main/`, so link and metadata changes should land together.

## Revision History

- [2026-11-06] Added the Pages prerequisite and permissions, SHA pinning, `fullscreen`-only demo until TSK-002 and TSK-003 land, a story exclusion mechanism, the `homepage` field, and a manual checklist for the listing.
