---
id: PLN-002
title: Ship the audit to Storybook 10 users on latest
status: pending
created: 2026-11-06
complexity: low
---

## Goal

Make `storybook-vrhythm/audit` reachable from the default install before Storybook 11 reaches GA.

## Context

`latest` is 0.5.0, without the audit. `next` carries it, and `1.0.0-next.1` ran on Storybook 10.6.6 with a peer range that includes `^10.0.0`. The repo is in Changesets prerelease mode until Storybook 11 GA, so the audit's reach depends on another project's date. Storybook 10 is not continuously tested in CI.

## Approach

1. Decide between a `0.6.0` on `latest` and a docs-only change.
2. For a release, choose how to publish from outside prerelease mode, for example a maintenance branch.
3. Add Storybook 10 to the CI matrix, at least for the audit stories.
4. In any case, state in the README that the audit needs `@next` today.

## Files to Modify

- `packages/storybook-vrhythm/README.md` — say which tag has the audit
- `packages/storybook-vrhythm/llms.txt` — same
- `.changeset/pre.json` — only if the release path needs it
- `.github/workflows/` — Storybook 10 job

## Risks & Considerations

- npm trusted publishing names `publish.yml` and environment `npm-release`, so keep both.
- A maintenance line adds release overhead until `1.0.0`.

## Open Questions

- Is a `0.6.0` worth the overhead, or is pointing Storybook 10 users at `@next` enough?
