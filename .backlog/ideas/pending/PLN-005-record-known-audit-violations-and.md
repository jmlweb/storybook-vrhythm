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

1. Precondition: do this after TSK-011 (`edges` option and grouped deltas) and TSK-010 (anchor origin, which covers TSK-003's centered layout), and only if those are not enough for adoption. A centered story's deltas change with viewport height today, so recorded deltas would flap until TSK-010 lands. Re-review this idea after TSK-011 ships.
2. Compare it with the existing escape hatches. `data-vrhythm-ignore` and the `ignore` option skip an element and its subtree for good (`README.md:246`). A known list adds value only if it keeps each recorded delta and still fails on a regression. Write that difference into the README.
3. Decide how the list gets updated. `expectRhythm` runs in the browser inside a `play` function and cannot write a checked-in file, so "fixed violations shrink the list" needs a Node-side step or a manual edit. Pick the storage after this: a checked-in JSON file imported by the story, or an in-story `known: [...]` option.
4. Match known violations by selector and edge in a new pure function in `find-violations.ts`, leaving `findViolations` and its callers unchanged. Fail on unlisted violations, and on listed ones whose delta changed by more than `tolerance`. Add a `RhythmReport` field for entries that no longer match, so stale ones surface.
5. Add unit tests in `test/find-violations.test.ts` and `test/audit.test.ts`.
6. Update the README and `llms.txt`, including a rule for agents: never add or edit entries to make a test pass, the same rule `llms.txt` already gives for `tolerance` and the assertion.
7. Add a changeset.

## Files to Modify

- `packages/storybook-vrhythm/src/audit.ts` — known-violation handling
- `packages/storybook-vrhythm/src/find-violations.ts` — matching
- `packages/storybook-vrhythm/test/find-violations.test.ts` and `test/audit.test.ts` — coverage
- `packages/storybook-vrhythm/README.md` and `packages/storybook-vrhythm/llms.txt` — workflow and agent rule
- `.changeset/` — new changeset

## Risks & Considerations

- Selectors from `describeElement` use `:nth-of-type` and classes (`src/audit.ts:140-174`), so markup changes can break a match, hide a new problem or flag an old one.
- A known list can become a permanent excuse. Consider reporting its size on every run.
- Coding agents must not be able to silence the audit by growing the list.
- TSK-011 edits `audit.ts` and `find-violations.ts` too, so sequence the two.
- Baseline deltas depend on font metrics, so local and CI can differ by subpixels. Exact delta equality would flap.
- Turning on `anchor` from TSK-010 moves the origin, so every recorded delta goes stale at once.
- It may turn out unnecessary if `edges` and grouping are enough.

## Open Questions

- Checked-in file or in-story option, and how is the file updated?
- Should a growing list fail CI?

## Revision History

- [2026-11-06] Added the PLN-003 and TSK-003 precondition, a comparison with `ignore` and `data-vrhythm-ignore`, the browser write limitation, tests, changeset and the `llms.txt` agent rule.
- [2026-11-06] Pointed preconditions to TSK-011 and TSK-010 and added a re-review after TSK-011; moved matching to a new pure function with `tolerance`-based delta comparison and a `RhythmReport` field for stale entries; added origin-change and font-metrics risks.
- [2026-11-07] TSK-010 and TSK-011 landed, so its preconditions are met and it is due for re-review. audit todo and auditOptions edges top now cover gradual adoption, so it may be unnecessary. The story anchor default removes the flapping deltas risk for centered stories.
