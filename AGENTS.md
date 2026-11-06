# storybook-vrhythm

## What is this?

An npm package that measures Storybook stories against a baseline grid and draws that grid as an overlay. Coding agents are the primary audience: changes must keep the audit trustworthy and its output actionable without a screenshot.

## Project Structure

Monorepo managed with pnpm workspaces and Turborepo.

```text
packages/
  storybook-vrhythm/        # Addon package (published to npm)
    src/
      index.ts              # Package entry point (CSF Next default export, withVRhythm and presets)
      withVRhythm.ts        # The decorator
      types.ts              # TypeScript interfaces (StyleProps, ConfigProps, StyleObj)
      constants.ts          # Default values and DOM selectors
      getStyle.ts           # Generates CSS style object for the rhythm overlay
      resolve-params.ts     # Merges defaults, presets, story params and toolbar globals
      utils.ts              # DOM manipulation (inject/remove overlay element, anchor sync)
      find-violations.ts    # Compares measurements to the grid
      audit.ts              # auditRhythm and expectRhythm (storybook-vrhythm/audit export)
      auto-audit.ts         # afterEach behind parameters.vrhythm.audit
      rhythm-errors.ts      # Error codes, createError, failure message
      presets.ts            # Built-in rhythm presets (pixel grids 4px to 32px, plus aliases material, tailwind, bootstrap, carbon)
      preset.ts             # Storybook preset entry (intentionally empty, auto-discovery)
      preview.ts            # Storybook preview annotations (decorator + toolbar toggle)
      storybook-parameter-augmentation.ts  # Type augmentation for Storybook parameters/globals
    skills/storybook-vrhythm/SKILL.md  # Agent Skill, published. The root `skills` is a symlink to skills/
    test/
      audit.test.ts         # Unit tests for the audit, with stubbed rects
      auto-audit.test.ts    # Unit tests for parameters.vrhythm.audit
      find-violations.test.ts  # Unit tests for grid comparison
      getStyle.test.ts      # Unit tests for getStyle
      index.test.ts         # Unit tests for the decorator (withVRhythm)
      utils.test.ts         # Unit tests for DOM manipulation utilities
apps/
  react/                    # Storybook + React integration test app
  vue/                      # Storybook + Vue integration test app
  html/                     # Storybook + HTML/Vite integration test app
```

## Tech Stack

| Area            | Tool                        |
| --------------- | --------------------------- |
| Language        | TypeScript (strict mode)    |
| Build           | tsdown                      |
| Test            | Vitest + jsdom              |
| Package Manager | pnpm                        |
| Storybook       | v11 beta in dev (peer: `^10.0.0 \|\| ^11.0.0-0`) |
| CI              | GitHub Actions              |
| Formatting      | Biome                       |
| Linting         | Biome, `tsc --noEmit`       |
| Orchestration   | Turborepo                   |
| Node            | Consumers: >= 22.12. Repo development and CI: `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` (jsdom), enforced by `engineStrict` |

## Scripts

```bash
# Root (runs across all packages via Turborepo)
pnpm build            # Build all packages
pnpm test             # Test all packages
pnpm typecheck        # Type-check all packages
pnpm dev              # Dev mode for all packages
pnpm lint             # Lint and check formatting with Biome (whole repo)
pnpm lint:fix         # Apply Biome fixes (whole repo)

# Addon package only
pnpm -F storybook-vrhythm build
pnpm -F storybook-vrhythm test
pnpm -F storybook-vrhythm test:watch
pnpm -F storybook-vrhythm test:coverage
pnpm -F storybook-vrhythm typecheck
```

## Code Conventions

- **Named exports only** — no default exports (exceptions: `preview.ts` must use a default export for the Storybook preset protocol, and `index.ts` must default-export the CSF Next addon factory)
- **Functional approach** — no classes
- **File names**: `kebab-case`
- **Variables/functions**: `camelCase`
- **Types/interfaces**: `PascalCase`
- **Const maps over enums**
- **Immutability** — prefer spreading and mapping over mutation
- **No `any`** — use specific interfaces or generics

## Key Design Decisions

- The decorator injects a `<div>` with id `storybook-rhythm` into the DOM body. It is never placed inside a framework root
- The grid starts at the story root by default (`anchor`), so audit results do not depend on layout or viewport height. Docs pages always use `'page'`
- `audit: 'error'` throws from `afterEach`: a `failed` report alone neither fails Vitest nor reaches `@storybook/addon-mcp`
- It uses CSS `linear-gradient` for the rhythm lines (no images, no canvas)
- `pointerEvents: 'none'` ensures the overlay doesn't interfere with interaction
- Parameters are passed via Storybook's story-level `parameters.vrhythm`
- Visibility can be toggled via Storybook toolbar (globals) or per-story `hide` param
- Presets provide ready-made configurations. Design-system names (`material`, `tailwind`, `bootstrap`, `carbon`) are aliases in `presetAliases`: they resolve to a base pixel preset and have no style of their own
- The package supports manual decorator usage, automatic preset registration and CSF Next (`definePreview({ addons: [vrhythm()] })`)

## Architecture Notes

### Parameter Resolution Order

```text
DEFAULT_PARAMS → preset styles → story-level parameters (raw)
```

Later sources override earlier ones. The story-level `hide` param takes precedence over the `globals.vrhythm` toolbar toggle (author intent wins over interactive toggle).

### DOM Strategy

- `getOrCreateElement()` reuses existing `#storybook-rhythm` div if present
- `injectStyle()` clears the reused element's inline styles and dataset, so nothing leaks from the previous story
- `keepOverlayInSync()` positions the overlay with a `ResizeObserver`. Decorators run before render and `useEffect` fires after `play`, so hooks cannot do this
- `auditRhythm()` calls `syncOverlay()` itself before reading the origin, because the observer can lag by a frame
- `removeElement()` removes the div entirely (not just hides it)

### Module Boundaries

| Module      | Responsibility                | Pure?                    |
| ----------- | ----------------------------- | ------------------------ |
| `constants` | Default values, selectors     | Yes                      |
| `types`     | TypeScript interfaces         | N/A                      |
| `presets`   | Built-in rhythm configs       | Yes                      |
| `getStyle`  | StyleProps -> CSS style obj   | Yes                      |
| `resolve-params` | Context -> final params  | Yes                      |
| `utils`     | DOM inject/remove, anchor sync | No (DOM side effects)   |
| `find-violations` | Measurements -> violations | Yes                     |
| `audit`     | Measure DOM, assert rhythm    | No (reads layout)        |
| `auto-audit` | `afterEach` for `audit` param | No (reads layout)       |
| `rhythm-errors` | Error codes, failure message | Yes                   |
| `index`     | Public API, CSF Next factory  | No (re-exports, default factory) |
| `withVRhythm` | Decorator wiring            | No (orchestrates)        |
| `preset`    | Empty (SB auto-discovers preview) | N/A                  |
| `preview`   | Storybook preview annotations | No (registers decorator) |
| `storybook-parameter-augmentation` | Type augmentation for SB parameters/globals | N/A |

## Testing

- Tests live in `test/` directory (not co-located)
- Test file naming: `<module>.test.ts`
- Focus on pure function testing (`getStyle`), decorator behavior (`index`), and DOM manipulation (`utils`)
- Use `jsdom` environment for DOM tests
- jsdom has no layout, so `audit` tests stub rects. `apps/react/src/stories/Audit.stories.tsx` checks real layout through `play` functions (`pnpm -F @apps/react test`, needs `playwright install chromium`)

## Publishing

- Published to npm as `storybook-vrhythm`
- Only `dist/`, `llms.txt` and `skills/` are included in the published package, plus the files npm always ships (`LICENSE`, `README.md`, `package.json`)
- `packages/storybook-vrhythm/llms.txt` is the source. The root `llms.txt` is a symlink to it
- Versions come from Changesets: run `pnpm changeset`, CI opens the version PR, and merging it publishes through npm trusted publishing. The npm entry names workflow `publish.yml` and environment `npm-release`, so keep both names in sync
- The repo is in Changesets prerelease mode (`.changeset/pre.json`), so releases go to the `next` dist-tag. At Storybook 11 GA, run `pnpm changeset pre exit` to release `1.0.0` to `latest`
- ESM-only (`"type": "module"`)

## Common Pitfalls

- **Don't add JSX to the addon** — no addon source file uses JSX; the `.ts` extension is intentional. Apps may use `.tsx`
- **Don't add `previewAnnotations` to `preset.ts`** — Storybook auto-discovers `./preview` from the exports map; adding it to the preset causes a double-import crash
- **Don't break the preview protocol** — `preview.ts` must use `export default` (Storybook requirement)
- **Don't import `index.ts` from `preview.ts`** — `index.ts` imports `preview.ts` for the CSF Next factory, so the shared decorator lives in `withVRhythm.ts` to avoid a cycle
- **Keep both registration paths working** — `apps/react` and `apps/vue` use CSF Next, while `apps/html` uses classic `main.ts` registration
- **Don't add runtime dependencies** — the package has zero production dependencies; only `storybook` as peer
- **Keep agent docs in step** — a change to the public API updates `README.md`, `llms.txt` and `skills/storybook-vrhythm/SKILL.md`. Error codes are public: do not rename them
- **Do not use a top margin in story fixtures** — it collapses through the root and moves the grid origin
- **Always run `pnpm test` after changing `src/`** — tests catch regressions in style generation and DOM handling
- **Don't modify `DIV_ID` or `PARENT_SELECTOR`** — consumers may depend on `#storybook-rhythm` for custom styling
