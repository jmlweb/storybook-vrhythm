# Contributing to storybook-vrhythm

Bug reports, fixes and new ideas are all welcome. Everything happens through [GitHub issues](https://github.com/jmlweb/storybook-vrhythm/issues) and pull requests against `main`.

## Setup

You need a Node.js version allowed by `engines` in the root `package.json` (`.node-version` pins one) and [pnpm](https://pnpm.io). Corepack or any pnpm install works: the version is set in `packageManager`.

```bash
pnpm install
pnpm build
```

## Layout

The addon lives in `packages/storybook-vrhythm`. The apps in `apps/` are real Storybook instances (React, Vue, HTML) whose stories run as browser tests. `apps/react` holds the audit suite and the demos. `apps/vue` and `apps/html` keep a few smoke stories for their framework and registration path.

Run one to see your change:

```bash
pnpm -F @apps/react dev
```

## Before you open a pull request

```bash
pnpm lint       # Biome: lint and format check (pnpm lint:fix applies fixes)
pnpm typecheck
pnpm test
pnpm build
```

- Add tests in `packages/storybook-vrhythm/test` for code changes.
- Update the docs if you change the public API: `packages/storybook-vrhythm/README.md`, `docs/reference.md`, `llms.txt` and `skills/storybook-vrhythm/SKILL.md`.
- Keep the package free of runtime dependencies.

## Changesets

If your change affects users of the package, add a changeset and commit it with your code:

```bash
pnpm changeset
```

Maintainers handle versioning and publishing. CI opens a version pull request, and merging it publishes to npm.

## Reporting bugs

A good report includes your Storybook version, framework, the `parameters.vrhythm` you used, what you expected and what happened. A minimal reproduction helps most.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
