---
id: TSK-001
title: Fix: Rhythm audit is missing from the default install
status: pending
priority: P2
tags: []
created: 2026-11-06
source: report/RPT-001
depends-on: []
---

# Fix: Rhythm audit is missing from the default install

## Description

### Summary

`latest` is 0.5.0, which has no `storybook-vrhythm/audit`. The README quick start installs `latest` and leads with the audit, and never says the audit needs `@next`.

### Key Details

- Repro: `npm i -D storybook-vrhythm`, then import the audit. Result: `TS2307: Cannot find module 'storybook-vrhythm/audit'`.
- `1.0.0-next.1` ran on Storybook 10.6.6. Its peer range is `^10.0.0 || ^11.0.0-0`.
- README line 34 tells Storybook 10 readers that `latest` is their version.
- Related: PLN-002 decides whether the audit ships on `latest`. This task is the docs fix that holds either way.

## Acceptance Criteria

- [ ] README says the audit needs the next tag until it ships on latest
- [ ] A Storybook 10 reader is not told latest is the right version for the audit
- [ ] Importing storybook-vrhythm/audit succeeds after the documented install command

## Notes

## Learnings

## Progress Log

- [2026-11-06] Created