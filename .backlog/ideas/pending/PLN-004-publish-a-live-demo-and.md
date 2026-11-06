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

1. Deploy `apps/react` Storybook from CI, for example to GitHub Pages.
2. Add a demo link and a failing audit output near the top of the README.
3. Add a short comparison with the core grid: baseline lines plus numeric checks.
4. Update the GitHub description, topics and homepage.

## Files to Modify

- `.github/workflows/` — demo deploy
- `packages/storybook-vrhythm/README.md` — demo link, audit output, comparison

## Risks & Considerations

- Audit stories that fail on purpose must not break the app's test run, so keep them separate or assert on the report.
- The demo uses Storybook 11 beta while `latest` targets Storybook 10.
