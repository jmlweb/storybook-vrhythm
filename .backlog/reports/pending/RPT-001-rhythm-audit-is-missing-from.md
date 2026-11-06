---
id: RPT-001
title: Rhythm audit is missing from the default install
type: finding
severity: high
status: pending
created: 2026-11-06
---

## Summary

The GitHub README documents `storybook-vrhythm/audit` and its quick start installs the `latest` tag, but `latest` is 0.5.0, which has no audit export.

## Details

0.5.0 exports `.`, `./preview`, `./preset` and `./package.json`. The audit only exists in `1.0.0-next.*`. The README never says the audit needs `@next`. Its only note about the tag (README line 34) says `latest` "supports Storybook 10 only", so a Storybook 10 reader concludes `latest` is the right version.

## Where found

`packages/storybook-vrhythm/README.md` quick start and requirements, tested on a fresh Vite + React + Storybook 10.6.6 app.

## Evidence

`npm i -D storybook-vrhythm` installs 0.5.0, then importing the audit fails:

    error TS2307: Cannot find module 'storybook-vrhythm/audit' or its corresponding type declarations.

`1.0.0-next.1` installed, loaded and ran its audit on Storybook 10.6.6. Its peer range is `^10.0.0 || ^11.0.0-0`.

## Impact

The feature that differentiates the addon is unreachable by following the docs. See the idea on shipping the audit to Storybook 10 users.
