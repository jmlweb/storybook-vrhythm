# storybook-vrhythm

## What is this?

An npm package that provides a Storybook decorator and preset addon for overlaying vertical rhythm guide lines on stories. It helps developers visually verify that their components align to a baseline grid.

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
      utils.ts              # DOM manipulation (inject/remove overlay element)
      presets.ts            # Built-in rhythm presets (4px, 8px, 16px, 24px, material, tailwind, bootstrap)
      preset.ts             # Storybook preset entry (intentionally empty, auto-discovery)
      preview.ts            # Storybook preview annotations (decorator + toolbar toggle)
      storybook-parameter-augmentation.ts  # Type augmentation for Storybook parameters/globals
    test/
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
| Build           | tsup                        |
| Test            | Vitest + jsdom              |
| Package Manager | pnpm                        |
| Storybook       | v11 beta in dev (peer: `^10.0.0 \|\| ^11.0.0-0`) |
| CI              | GitHub Actions              |
| Formatting      | Prettier                    |
| Linting         | `tsc --noEmit`              |
| Orchestration   | Turborepo                   |
| Node            | Consumers: >= 22.12. Repo development and CI: `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` (jsdom) |

## Scripts

```bash
# Root (runs across all packages via Turborepo)
pnpm build            # Build all packages
pnpm test             # Test all packages
pnpm typecheck        # Type-check all packages
pnpm dev              # Dev mode for all packages

# Addon package only
pnpm -F storybook-vrhythm build
pnpm -F storybook-vrhythm test
pnpm -F storybook-vrhythm test:watch
pnpm -F storybook-vrhythm test:coverage
pnpm -F storybook-vrhythm typecheck
pnpm -F storybook-vrhythm format
pnpm -F storybook-vrhythm format:check
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

- The decorator injects a `<div>` with id `storybook-rhythm` into the DOM body
- It uses CSS `linear-gradient` for the rhythm lines (no images, no canvas)
- `pointerEvents: 'none'` ensures the overlay doesn't interfere with interaction
- Parameters are passed via Storybook's story-level `parameters.vrhythm`
- Visibility can be toggled via Storybook toolbar (globals) or per-story `hide` param
- Presets provide ready-made configurations (e.g., `material`, `tailwind`, `bootstrap`)
- The package supports manual decorator usage, automatic preset registration and CSF Next (`definePreview({ addons: [vrhythm()] })`)

## Architecture Notes

### Parameter Resolution Order

```text
DEFAULT_PARAMS → preset styles → story-level parameters (raw)
```

Later sources override earlier ones. The story-level `hide` param takes precedence over the `globals.vrhythm` toolbar toggle (author intent wins over interactive toggle).

### DOM Strategy

- `getOrCreateElement()` reuses existing `#storybook-rhythm` div if present
- `injectStyle()` appends to parent or moves element when container changes
- `removeElement()` removes the div entirely (not just hides it)

### Module Boundaries

| Module      | Responsibility                | Pure?                    |
| ----------- | ----------------------------- | ------------------------ |
| `constants` | Default values, selectors     | Yes                      |
| `types`     | TypeScript interfaces         | N/A                      |
| `presets`   | Built-in rhythm configs       | Yes                      |
| `getStyle`  | StyleProps -> CSS style obj   | Yes                      |
| `utils`     | DOM inject/remove             | No (DOM side effects)    |
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

## Publishing

- Published to npm as `storybook-vrhythm`
- Only `dist/` folder is included in the published package
- Bump version in `package.json` before publishing
- ESM-only (`"type": "module"`)

## Common Pitfalls

- **Don't add JSX to the addon** — no addon source file uses JSX; the `.ts` extension is intentional. Apps may use `.tsx`
- **Don't add `previewAnnotations` to `preset.ts`** — Storybook auto-discovers `./preview` from the exports map; adding it to the preset causes a double-import crash
- **Don't break the preview protocol** — `preview.ts` must use `export default` (Storybook requirement)
- **Don't import `index.ts` from `preview.ts`** — `index.ts` imports `preview.ts` for the CSF Next factory, so the shared decorator lives in `withVRhythm.ts` to avoid a cycle
- **Keep both registration paths working** — `apps/react` uses CSF Next, while `apps/vue` and `apps/html` use classic `main.ts` registration
- **Don't add runtime dependencies** — the package has zero production dependencies; only `storybook` as peer
- **Always run `pnpm test` after changing `src/`** — tests catch regressions in style generation and DOM handling
- **Don't modify `DIV_ID` or `PARENT_SELECTOR`** — consumers may depend on `#storybook-rhythm` for custom styling
