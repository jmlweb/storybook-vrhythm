# storybook-vrhythm

## What is this?

An npm package that provides a Storybook decorator and preset addon for overlaying vertical rhythm guide lines on stories. It helps developers visually verify that their components align to a baseline grid.

## Project Structure

Monorepo managed with pnpm workspaces and Turborepo.

```text
packages/
  storybook-vrhythm/        # Addon package (published to npm)
    src/
      index.ts              # Decorator entry point (withVRhythm named export)
      types.ts              # TypeScript interfaces (StyleProps, ConfigProps, StyleObj)
      constants.ts          # Default values and DOM selectors
      getStyle.ts           # Generates CSS style object for the rhythm overlay
      utils.ts              # DOM manipulation (inject/remove overlay element)
      presets.ts            # Built-in rhythm presets (4px, 8px, 16px, 24px, material, tailwind, bootstrap)
      preset.ts             # Storybook preset entry (intentionally empty, auto-discovery)
      preview.ts            # Storybook preview annotations (decorator + toolbar toggle)
    test/
      getStyle.test.ts      # Unit tests for getStyle
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
| Storybook       | v10+ (peer dependency: 10+) |
| CI              | GitHub Actions              |
| Formatting      | Prettier                    |
| Linting         | `tsc --noEmit`              |
| Orchestration   | Turborepo                   |
| Node            | >= 20                       |

## Scripts

```bash
# Root (runs across all packages via Turborepo)
pnpm build            # Build all packages
pnpm test             # Test all packages
pnpm lint             # Lint all packages
pnpm dev              # Dev mode for all packages

# Addon package only
pnpm -F storybook-vrhythm build
pnpm -F storybook-vrhythm test
pnpm -F storybook-vrhythm test:watch
pnpm -F storybook-vrhythm test:coverage
pnpm -F storybook-vrhythm lint
pnpm -F storybook-vrhythm format
pnpm -F storybook-vrhythm format:check
```

## Code Conventions

- **Named exports only** — no default exports (exception: `preview.ts` which must use default export for Storybook preset protocol)
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
- The package supports both manual decorator usage and automatic preset registration

## Architecture Notes

### Parameter Resolution Order

```text
DEFAULT_PARAMS → preset styles → story-level parameters (raw)
```

Later sources override earlier ones. The `globals.vrhythm` toolbar toggle takes precedence over `params.hide`.

### DOM Strategy

- `getOrCreateElement()` reuses existing `#storybook-rhythm` div if present
- `injectStyle()` only appends to parent when the element has no `parentNode`
- `removeElement()` removes the div entirely (not just hides it)

### Module Boundaries

| Module      | Responsibility                | Pure?                    |
| ----------- | ----------------------------- | ------------------------ |
| `constants` | Default values, selectors     | Yes                      |
| `types`     | TypeScript interfaces         | N/A                      |
| `presets`   | Built-in rhythm configs       | Yes                      |
| `getStyle`  | StyleProps -> CSS style obj   | Yes                      |
| `utils`     | DOM inject/remove             | No (DOM side effects)    |
| `index`     | Decorator wiring              | No (orchestrates)        |
| `preset`    | Empty (SB auto-discovers preview) | N/A                  |
| `preview`   | Storybook preview annotations | No (registers decorator) |

## Testing

- Tests live in `test/` directory (not co-located)
- Test file naming: `<module>.test.ts`
- Focus on pure function testing (`getStyle`) and DOM manipulation (`utils`)
- Use `jsdom` environment for DOM tests

## Publishing

- Published to npm as `storybook-vrhythm`
- Only `dist/` folder is included in the published package
- Bump version in `package.json` before publishing
- ESM-only (`"type": "module"`)

## Common Pitfalls

- **Don't add JSX to the addon** — no addon source file uses JSX; the `.ts` extension is intentional. Apps may use `.tsx`
- **Don't add `previewAnnotations` to `preset.ts`** — Storybook 10 auto-discovers `./preview` from the exports map; adding it to the preset causes a double-import crash
- **Don't break the preview protocol** — `preview.ts` must use `export default` (Storybook requirement)
- **Don't add runtime dependencies** — the package has zero production dependencies; only `storybook` as peer
- **Always run `pnpm test` after changing `src/`** — tests catch regressions in style generation and DOM handling
- **Don't modify `DIV_ID` or `PARENT_SELECTOR`** — consumers may depend on `#storybook-rhythm` for custom styling
