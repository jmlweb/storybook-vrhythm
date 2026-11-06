# PR Review: #40 - feat(react,storybook-vrhythm): add rhythm audit and expectRhythm

**Author**: @jmlweb
**Branch**: `feat/rhythm-audit` → `master`
**Status**: OPEN | **Mergeable**: MERGEABLE
**Size**: XLarge (24 files, +1610/-198 lines). One feature; about 700 added lines are tests and lockfile, so no split suggested.

---

## Summary

Sound overall. The audit is well isolated, zero-dependency, packs correctly, and its Chromium stories really run in CI. One defect breaks the PR's own "No false passes" claim: a non-finite `offset` (and, by the same arithmetic, `lineHeight: Infinity` or `tolerance: NaN`) makes `expectRhythm` pass on off-grid layout. The rest is test hardening and small input-handling gaps.

Agent findings were checked against the code before inclusion. Where a check changed a finding, its text or severity was adjusted and the change is noted. Rejected findings are listed at the end.

## Risk Assessment
**Overall Risk**: 🟡 Medium

| Area | Risk | Reasoning |
|------|------|-----------|
| Security | 🟢 | Dev-only DOM measurement, no secrets or input surface. Security reviewer not dispatched. CI gains only a Playwright install step. |
| Quality | 🟡 | Non-finite options produce a false pass (#1, #2). |
| Tests | 🟡 | Jsdom coverage is 99.45% statements, 97.01% branches. Chromium stories have vacuous passes and no guard on dropped story files. |
| Perf | 🟢 | Selector building is quadratic in theory (#8), small on story-sized DOMs. |

## Standards
**Summary**: #1 Must Fix: non-finite `offset` makes `expectRhythm` pass on off-grid layout.

### Code Review

- #1 packages/storybook-vrhythm/src/audit.ts:120: Must Fix: `offset` is never checked for finite, so `NaN` or `Infinity` makes `origin` NaN, every `delta` NaN, and `Math.abs(NaN) > tolerance` false; reject non-finite values in `parseLength` and add a test. **Reproduced in Chromium:** adding `await expectRhythm(canvasElement, { offset: Number.NaN })` to the `OffGrid` story left it green. `lineHeight: Infinity` reaches the same state, because it passes the `> 0` check and `0 * Infinity` is NaN (from reading, not run).
- #2 packages/storybook-vrhythm/src/find-violations.ts:42: Should Fix: a `NaN` tolerance passes silently the same way, and a negative tolerance reports every edge, including exact ones; throw `RhythmConfigError` unless `Number.isFinite(tolerance) && tolerance >= 0`. (Adjusted: the agent called negative tolerance a silent pass; it fails loudly.)
- #3 packages/storybook-vrhythm/src/withVRhythm.ts:87: Should Fix: a numeric `lineHeight` (allowed by `StyleProps`) is published as `"16"`, which `parseLength` rejects, so `auditRhythm` throws; normalise numbers to `${n}px` so the overlay and audit agree. The unitless value is also invalid in the overlay's gradient, which predates this PR.
- #4 packages/storybook-vrhythm/README.md:158: Should Fix: the README says `lineHeight` takes `string | number`, but the audit rejects unitless overlay numbers and any unit except px/rem; state the limit in the README and `llms.txt`.
- #5 packages/storybook-vrhythm/src/audit.ts:224: Nice to Have: the box check builds `describeElement(...)` for every measured element, so cost is O(n·depth) plus an O(siblings) filter per step; compute the selector only for violations. (Downgraded from Should Fix: stories have small DOMs.)
- #6 apps/react/vitest.config.ts:19: Nice to Have: turbo can replay a passing browser test when inputs are unchanged, and a Chromium version change does not invalidate it; add `"cache": false` for `@apps/react#test` if browser tests must always run. (Downgraded from Should Fix.)
- #7 packages/storybook-vrhythm/src/find-violations.ts:42: Nice to Have: `Math.abs(delta) > tolerance` has no epsilon, so float noise such as 0.5000000001 fails at the default tolerance; compare `roundPx(delta)`.
- #8 packages/storybook-vrhythm/src/audit.ts:48: Info: `em`, `%` and `calc()` overlay line heights throw `RhythmConfigError`. The PR lists this as a known gap. (Downgraded from Should Fix.) Reading `getComputedStyle(overlay).backgroundSize` would remove the limit.
- #9 packages/storybook-vrhythm/src/audit.ts:183: Info: the canvas font omits `font-stretch`, `font-variant` and `font-size-adjust`. `font-stretch` and `font-size-adjust` are documented gaps; `font-variant` is not. (Downgraded from Should Fix.)
- #10 packages/storybook-vrhythm/src/utils.ts:32: Info: no stale `data-vrhythm-line-height`, since it is overwritten on every inject. Style keys do persist on the reused div, which predates this PR.
- #11 llms.txt:1: Info: the root symlink becomes a 35-byte text file on Windows checkouts without `core.symlinks`. The published copy is a real file, so npm consumers are unaffected.
- #12 .changeset/storybook-11-support.md:2: Info: the `major` changeset absorbs this PR's `minor`, so the result is `1.0.0-next.0`.
- #13 .changeset/pre.json:1: Info: outside this PR (from `acd100e`, already on master): the hand-written file has no `initialVersions` or `changesets` arrays, and a scratch `changeset version` did not record consumed changesets, so a later Version PR may re-bump; regenerate with `pnpm changeset pre enter next`. (Moved from Should Fix because it is not in this diff. The re-bump was not reproduced.)

### Test Coverage

- #14 apps/react/src/stories/Audit.stories.tsx:50: Should Fix: `GridFromPreset` and `HiddenOverlayNeedsOptions` (line 71) assert only `ok === true` and never `checked > 0`, so they pass vacuously if the block is not measured; assert `checked` is 2 or call `expectRhythm`.
- #15 .github/workflows/ci.yml:40: Should Fix: nothing guards the story count, so a story file that fails discovery (the "no tests" case the PR mentions) drops out while `vitest run` stays green; add a check on the number of tests.
- #16 apps/react/src/stories/Audit.stories.tsx:109: Should Fix: the 1px limit is looser than the default tolerance of 0.5; tighten it to 0.01. **Measured:** all four font sizes pass at 0.01 in local Chromium, which also answers the code reviewer's question about ascent mismatch for this font and setup.
- #17 apps/react/src/stories/Audit.stories.tsx:80: Should Fix: the baseline story covers one family, regular weight, `line-height: normal` and single-line text; add wrapped, bold, italic and inline-element text.
- #18 packages/storybook-vrhythm/test/audit.test.ts:268: Should Fix: `fakeCanvas` never asserts the font string built at `audit.ts:183`, so a broken string still passes; capture the assigned font and assert it.
- #19 packages/storybook-vrhythm/src/withVRhythm.ts:88: Should Fix: the `finalParams.lineHeight ?? DEFAULT_LINE_HEIGHT` default is untested, but it is the attribute `auditRhythm` reads when a story sets no `lineHeight`; add an index test.
- #20 packages/storybook-vrhythm/src/audit.ts:75: Nice to Have: the string `'0'` shortcut is never hit by tests. (Downgraded from Should Fix.)
- #21 packages/storybook-vrhythm/src/audit.ts:286: Nice to Have: the `describeAnchor(root) ?? describeStep(root)` fallback for bare text in an anchorless root is untested. (Downgraded from Should Fix.)
- #22 packages/storybook-vrhythm/src/audit.ts:133: Nice to Have: the `parentElement?.children ?? []` fallback is untested.
- #23 apps/react/src/stories/Audit.stories.tsx:21: Nice to Have: no story runs `ignore`, `data-vrhythm-ignore`, `rem`, hidden elements, inline skipping or shared-edge dedupe in real layout; add one mixed-markup story.
- #24 packages/storybook-vrhythm/test/audit.test.ts:278: Info: the baseline unit tests stub both rects and ascent, so they prove only the arithmetic; real behaviour rests on `BaselineMatchesBrowser`.
- #25 packages/storybook-vrhythm/test/audit.test.ts:384: Info: the web-font test proves the await, not that fonts load before canvas measurement.
- #26 apps/react/vitest.config.ts:14: Info: system fonts make the story run deterministic on layout; a web font not yet requested when `document.fonts.ready` resolves is an unexercised risk.

## Spec
**Source**: PR body (no task ID, issue or `.backlog/`)
**Summary**: no blocking findings. All stated behaviour is present, with one exception: #1 contradicts "No false passes".

- #27 packages/storybook-vrhythm/src/audit.ts:368: Must Fix: "No false passes." — the "Nothing was measured" guard is present, but a non-finite option still gives a false pass with `checked > 0`; see #1.
- #28 packages/storybook-vrhythm/src/audit.ts:48: Info: "`auditRhythm` measures elements against the baseline grid" — `rem` lengths, `RhythmConfigError`, `MAX_REPORTED_VIOLATIONS` and `[data-testid]`/`#id` selector anchors are extras the PR body does not list. All are reasonable parts of the feature. (Downgraded from Nice to Have.)

## CI Checks
| Check | Status |
|-------|--------|
| ci (22.22.2) | ✅ pass (1m9s) |
| ci (24) | ✅ pass (1m6s) |

Run 42127899237 ran `@apps/react:test` with a cache miss on Chromium: `Audit.stories.tsx (6 tests)`, `Rhythm.stories.tsx (11 tests)`. Of the 17 story tests, 6 are new.

## Recommendations

### Standards

#### 🔴 Critical (blocks merge)
None.

#### 🟠 Must Fix (blocks merge)
- #1 packages/storybook-vrhythm/src/audit.ts:120

#### 🟡 Should Fix (before merge recommended)
- #2 packages/storybook-vrhythm/src/find-violations.ts:42
- #3 packages/storybook-vrhythm/src/withVRhythm.ts:87
- #4 packages/storybook-vrhythm/README.md:158
- #14 apps/react/src/stories/Audit.stories.tsx:50
- #15 .github/workflows/ci.yml:40
- #16 apps/react/src/stories/Audit.stories.tsx:109
- #17 apps/react/src/stories/Audit.stories.tsx:80
- #18 packages/storybook-vrhythm/test/audit.test.ts:268
- #19 packages/storybook-vrhythm/src/withVRhythm.ts:88

#### 🟢 Nice to Have (follow-up)
#5, #6, #7, #20, #21, #22, #23

#### ℹ️ Info (no action needed)
#8, #9, #10, #11, #12, #13, #24, #25, #26

### Spec

#### 🟠 Must Fix (blocks merge)
- #27 packages/storybook-vrhythm/src/audit.ts:368 (same fix as #1)

#### ℹ️ Info (no action needed)
#28

## Rejected findings

- **`publish.yml` scope creep (spec agent, Should Fix):** false. It compared against a stale local `master` (`6a47f0d`). Against `origin/master` (`0ffe758`), `publish.yml` is +2/-0.
- **`package.json` and tooling scope creep (spec agent, Should Fix):** false, same cause. The tsdown migration and Storybook 11 changes are not in this diff.
- **Unawaited `expect` in `forEach` (`Audit.stories.tsx:108`, QA, Should Fix):** false. Changing the bound to `-1` failed the story, so failures are not swallowed.
- **Wrapper dedupe hides a child's off-grid edge (`audit.ts:231`, spec agent):** false. The shared edge is still reported on the parent, and `root` edges are not in the set.
- **`storybookScript: 'pnpm dev'` (part of the original `vitest.config.ts:19` finding):** the code reviewer itself rated this harmless. Only the turbo cache point remains, as #6.

## Decision
- [ ] ✅ **Approve**
- [x] 🔄 **Request Changes** (recommended: #1, a small fix)
- [ ] 💬 **Comment**
