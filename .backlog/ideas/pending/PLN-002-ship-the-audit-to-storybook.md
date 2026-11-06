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

1. Precondition: publish `next.2` first. `1.0.0-next.1` returned `ok: true` with a collapsed overlay, and the `ee857f8` conversion fix plus the `reject-unmeasurable-audits` changeset are unreleased. Whatever reaches `latest` must come after them, and after TSK-008 if the overlay guard should ship too.
2. Choose how the audit reaches `latest`:
   - **Move the dist-tag:** `npm dist-tag add storybook-vrhythm@1.0.0-next.N latest`. No maintenance branch and no release overhead, and the `^10.0.0 || ^11.0.0-0` peer already covers Storybook 10. The cost is that `latest` becomes a prerelease.
   - **Release `0.6.0`:** needs a maintenance branch, because `.changeset/pre.json` has `"mode": "pre"` and a `0.6.0` from `main` is impossible without exiting prerelease. It must keep a `^10.0.0` peer only, like `0.5.0`.
   - **Docs only:** leave `latest` alone and tell Storybook 10 readers to use `@next` (TSK-001).
3. Add a Storybook 10 CI job for the audit stories as a separate, scoped piece of work. CI has never run on Storybook 10: `ci.yml` varies only the Node version, and the dev `storybook` is pinned to `>=11.0.0-0 <12.0.0-0`, so the job needs a dependency override in the apps and the addon package.
4. Record the decision and the chosen release route in the README, once made.

## Files to Modify

- `.github/workflows/ci.yml` — Storybook 10 job (step 3)
- `.changeset/pre.json` — only if the release path exits prerelease
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — the decision's wording (the `@next` note itself is TSK-001)
- `pnpm-workspace.yaml` or the apps' `package.json` — Storybook 10 override, if CI needs it

## Risks & Considerations

- npm trusted publishing names `publish.yml` and environment `npm-release`, so keep both.
- A maintenance line adds release overhead until `1.0.0`.
- A `latest` that points at a prerelease surprises tooling that treats `latest` as stable.
- `0.5.0`'s peer is `^10.0.0` only, so a `0.6.0` must not widen it to Storybook 11.

## Related

- TSK-001: the README note that the audit needs `@next` (this idea's old step 4)
- TSK-008: the overlay guard, an optional precondition for the release

## Open Questions

- Is moving the dist-tag acceptable, or must `latest` stay a stable version?
- Is a `0.6.0` worth the overhead, or is pointing Storybook 10 users at `@next` enough?

## Revision History

- [2026-11-06] Added next.2 precondition and the dist-tag option; replaced the README step with a link to TSK-001; split out Storybook 10 CI work; noted that prerelease mode blocks a `0.6.0` from `main`.
