---
id: PLN-002
title: Ship the audit to Storybook 10 users on latest
status: pending
created: 2026-11-06
complexity: low
---

## Goal

Give Storybook 10 users a tested way to reach `storybook-vrhythm/audit` before Storybook 11 reaches GA, without changing `latest`: they install `@next` as documented by TSK-001, and CI proves the audit works on Storybook 10.

Complexity is medium, not the `low` in the frontmatter: the Storybook 10 CI job needs a dependency override across the apps and the addon package.

## Context

`latest` is 0.5.0, without the audit. `next` carries it, and `1.0.0-next.1` ran on Storybook 10.6.6 with a peer range that includes `^10.0.0`. The repo is in Changesets prerelease mode until Storybook 11 GA, so the audit's reach depends on another project's date. Storybook 10 is not continuously tested in CI.

## Decision

Docs only until Storybook 11 GA: `latest` stays on 0.5.0, and Storybook 10 readers use `@next` (TSK-001). `pnpm changeset pre exit` at GA then releases `1.0.0` to `latest`.

### Rejected alternatives

- **Move the dist-tag** (`npm dist-tag add storybook-vrhythm@1.0.0-next.N latest`): every new install would get a major prerelease before GA. It also carries breaking changes: `1.0.0-next.1` requires Node `>=22.12`, while 0.5.0 requires `>=22`.
- **Release `0.6.0`:** needs a maintenance branch, because `.changeset/pre.json` has `"mode": "pre"` and a `0.6.0` from `main` is impossible without exiting prerelease. It adds release overhead until `1.0.0`, and it must keep a `^10.0.0` peer only, like `0.5.0`.

## Approach

1. Precondition: publish `next.2` first. `1.0.0-next.1` returned `ok: true` with a collapsed overlay, and the `ee857f8` conversion fix plus the `reject-unmeasurable-audits` changeset are unreleased. The `@next` install that TSK-001 documents must come after them, and after TSK-008 if the overlay guard should ship too.
2. Add a Storybook 10 CI job for the audit stories. CI has never run on Storybook 10: `ci.yml` varies only the Node version, and the dev `storybook` is pinned to `>=11.0.0-0 <12.0.0-0`, so the job needs a dependency override in the apps and the addon package.
3. Update the README line that says Storybook 10 is not continuously tested, once the job runs.

## Files to Modify

- `.github/workflows/ci.yml` — Storybook 10 job
- `pnpm-workspace.yaml` or the apps' `package.json` — Storybook 10 override, if CI needs it
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — Storybook 10 test status (the `@next` note itself is TSK-001)

## Risks & Considerations

- npm trusted publishing names `publish.yml` and environment `npm-release`, so keep both when publishing `next.2`.
- `apps/react` and `apps/vue` use CSF Next, and `@storybook/addon-vitest` is pinned to Storybook 11 too, so the override may not resolve cleanly on Storybook 10.
- Until GA, the default install stays without the audit. Only the docs close that gap.
- If the decision is reopened, the dist-tag route breaks Node 22.0 to 22.11 users: npm warns, and installs fail under `engine-strict`.

## Related

- TSK-001: the README note that the audit needs `@next` (this idea's old step 4)
- TSK-008: the overlay guard, an optional precondition for `next.2`

## Revision History

- [2026-11-06] Added next.2 precondition and the dist-tag option; replaced the README step with a link to TSK-001; split out Storybook 10 CI work; noted that prerelease mode blocks a `0.6.0` from `main`.
- [2026-11-06] Chose docs only until Storybook 11 GA; moved the dist-tag and `0.6.0` routes to rejected alternatives; recorded the Node `>=22.12` break; made the Storybook 10 CI job the main work; closed the open questions; complexity noted as medium in the body.
