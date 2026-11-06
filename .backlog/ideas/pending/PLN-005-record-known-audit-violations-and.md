---
id: PLN-005
title: Record known audit violations and fail only on new ones
status: pending
created: 2026-11-06
complexity: medium
---

## Goal

Let a team with an existing design system record the audit's current violations and have `expectRhythm` fail only on new ones.

## Context

Split from PLN-003. On the Storybook scaffold, 7 of 8 Header edges and 25 of 26 Page edges failed at 8px. The `edges` option and grouped output help, but a team with many off-grid components still cannot turn the audit on without fixing everything first.

## Approach

1. Decide the storage: a checked-in file of selector, edge and delta per story, or an in-story option such as `known: [...]`.
2. Match known violations by selector and edge, and report fixed ones so the list shrinks.
3. Fail on violations not in the list, and on listed violations that changed delta.
4. Add tests and document the workflow in the README and `llms.txt`.

## Files to Modify

- `packages/storybook-vrhythm/src/audit.ts` — known-violation handling
- `packages/storybook-vrhythm/src/find-violations.ts` — matching
- `packages/storybook-vrhythm/test/` — coverage
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — workflow

## Risks & Considerations

- Selectors from `describeElement` use `:nth-of-type` and can change when markup changes, so a known list could go stale or hide new problems.
- A known list can become a permanent excuse. Consider reporting its size on every run.
- Coding agents must not be able to silence the audit by growing the list. The `llms.txt` prompt forbids deleting the assertion, so add the same rule here.

## Open Questions

- File or in-story option?
- Should a growing list fail CI?
