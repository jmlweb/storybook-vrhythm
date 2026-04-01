# Monorepo Migration Plan

Migration plan for `storybook-vrhythm` from single-package to monorepo with framework-specific Storybook apps for integration testing.

## Goal

Verify that the addon works correctly across all supported Storybook frameworks by running real Storybook instances per framework inside a monorepo with Turborepo caching.

## Tech Stack

| Tool       | Version       | Notes                                                     |
| ---------- | ------------- | --------------------------------------------------------- |
| pnpm       | 10.x (stable) | Already in use, workspace-native                          |
| Turborepo  | 2.x           | Cache + task orchestration                                |
| Storybook  | 10.x          | Already the peer dep target                               |
| TypeScript | 5.9.x         | Current project version (TS 6 available but not required) |
| Vite       | 8.x           | Default bundler for Storybook 10                          |
| React      | 19.x          | App dependency only                                       |
| Vue        | 3.5.x         | App dependency only                                       |
| Svelte     | 5.x           | App dependency only                                       |
| Node       | >= 20         | Already required                                          |

> **Note on TypeScript**: TS 6.0 shipped March 2026 but is the final JS-based release. TS 7 (Go-native) is preview-only. Staying on 5.9.x avoids being an early adopter of a transitional release; upgrade to 6.x can happen independently.

## Target Structure

```text
storybook-vrhythm/
├── packages/
│   └── storybook-vrhythm/          # Addon (moved from root)
│       ├── src/
│       ├── test/
│       ├── tsup.config.ts
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   ├── react/                      # Storybook + React
│   │   ├── .storybook/
│   │   │   └── main.ts
│   │   ├── src/
│   │   │   └── stories/
│   │   │       └── Rhythm.stories.ts
│   │   └── package.json
│   ├── vue/                        # Storybook + Vue
│   │   ├── .storybook/
│   │   │   └── main.ts
│   │   ├── src/
│   │   │   └── stories/
│   │   │       └── Rhythm.stories.ts
│   │   └── package.json
│   └── html/                       # Storybook + HTML (Vite)
│       ├── .storybook/
│       │   └── main.ts
│       ├── src/
│       │   └── stories/
│       │       └── Rhythm.stories.ts
│       └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json                   # Root tsconfig (references)
├── package.json                    # Root workspace
└── README.md
```

## Vertical Slices

Each slice is independently mergeable and adds value on its own.

---

### Slice 1: Monorepo Scaffolding + Addon Relocation

**Value**: Working monorepo with the addon building and tests passing, identical to current state.

#### Tasks

1. **Create root workspace files**
   - `pnpm-workspace.yaml` with `packages/*` and `apps/*`
   - Root `package.json` (private, no version) with workspace scripts
   - Root `tsconfig.json` with project references
   - `turbo.json` with pipeline definition

2. **Move addon to `packages/storybook-vrhythm/`**
   - Move `src/`, `test/`, `tsup.config.ts`, `tsconfig.json`, `vitest.config.ts` (if any), `preset.js`
   - Update `package.json` paths (no changes to exports map, they're relative to the package)
   - Verify `pnpm build`, `pnpm test`, `pnpm lint` pass from the package dir

3. **Configure Turborepo**
   - Define `build`, `test`, `lint`, `format:check` tasks
   - Set `build` outputs to `["dist/**"]`
   - Set `test` and `lint` with `dependsOn: ["build"]` (tests/lint may need built types)

4. **Update CI workflow**
   - Install Turborepo as root devDependency
   - Replace direct script calls with `turbo run build test lint`
   - Add Turborepo remote cache step (optional, can defer)

#### Acceptance Criteria

- `pnpm install` from root resolves all deps
- `turbo run build test lint` passes
- `pnpm -F storybook-vrhythm build` produces identical `dist/` output
- CI green on master

#### Specs

**`pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Root `package.json`**

```jsonc
{
  "name": "storybook-vrhythm-monorepo",
  "private": true,
  "packageManager": "pnpm@10.26.2",
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format:check": "turbo run format:check",
    "dev": "turbo run dev",
  },
  "devDependencies": {
    "turbo": "^2.9.0",
  },
}
```

**`turbo.json`**

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
    },
    "dev": {
      "dependsOn": ["^build"],
      "persistent": true,
      "cache": false,
    },
    "test": {
      "dependsOn": ["build"],
    },
    "lint": {
      "dependsOn": ["build"],
    },
    "format:check": {},
    "build-storybook": {
      "dependsOn": ["^build"],
      "outputs": ["storybook-static/**"],
    },
  },
}
```

**Root `tsconfig.json`**

```jsonc
{
  "references": [{ "path": "packages/storybook-vrhythm" }],
  "files": [],
}
```

---

### Slice 2: React Storybook App

**Value**: First real integration test — proves the addon loads, renders the overlay, and the toolbar toggle works in a React Storybook.

#### Tasks

1. **Scaffold the React app**
   - `apps/react/package.json` with deps: `react`, `react-dom`, `storybook`, `@storybook/react-vite`
   - Workspace dep on `storybook-vrhythm: "workspace:*"`
   - Scripts: `dev` (storybook dev), `build-storybook`

2. **Configure Storybook**
   - `apps/react/.storybook/main.ts`: framework `@storybook/react-vite`, register addon via `storybook-vrhythm`

3. **Create test stories**
   - `Rhythm.stories.ts` — a minimal `<div>` component with three story variants:
     - `Default` — addon active with no params (verifies default overlay)
     - `WithPreset` — uses `parameters.vrhythm.preset: 'tailwind'`
     - `Hidden` — uses `parameters.vrhythm.hide: true` (verifies no overlay)

4. **Add `build-storybook` to CI**
   - Turbo already picks it up via the `build-storybook` task
   - Verify it runs without errors

#### Acceptance Criteria

- `turbo run build-storybook --filter=@apps/react` succeeds
- `storybook-static/` is generated
- Running `storybook dev` locally shows the overlay and toolbar toggle works
- CI includes `build-storybook` step

#### Specs

**`apps/react/package.json`**

```jsonc
{
  "name": "@apps/react",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6006 --no-open",
    "build-storybook": "storybook build",
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
  },
  "devDependencies": {
    "storybook": "^10.0.0",
    "@storybook/react-vite": "^10.0.0",
    "storybook-vrhythm": "workspace:*",
  },
}
```

**`apps/react/.storybook/main.ts`**

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['storybook-vrhythm'],
  framework: '@storybook/react-vite',
};

export { config as default };
```

**`apps/react/src/stories/Rhythm.stories.ts`**

```typescript
import type { Meta, StoryObj } from '@storybook/react';

const Box = () => {
  const el = document.createElement('div');
  el.style.cssText = 'padding: 16px; font-family: sans-serif;';
  el.textContent = 'Check the vertical rhythm overlay behind this box.';
  return el;
};

// Use a simple render function to avoid JSX
const meta: Meta = {
  title: 'VRhythm/Integration',
  render: () => {
    // React render — return a plain element for simplicity
    return null; // Will use a proper React element below
  },
};
export { meta as default };

// Note: actual implementation should use createElement or a .tsx file
// The stories focus on testing parameter combinations

export const Default: StoryObj = {
  render: () =>
    Object.assign(document.createElement('div'), {
      textContent: 'Default rhythm overlay',
      style: 'padding: 32px; font-size: 16px; line-height: 24px;',
    }) as unknown as React.ReactElement,
};

export const WithPreset: StoryObj = {
  parameters: { vrhythm: { preset: 'tailwind' } },
  render: Default.render,
};

export const Hidden: StoryObj = {
  parameters: { vrhythm: { hide: true } },
  render: Default.render,
};
```

> **Implementation note**: Since the addon is framework-agnostic (DOM injection), the stories only need minimal components. Use `React.createElement('div', ...)` to avoid adding JSX/TSX files. If simpler, a `.tsx` file is also acceptable — but the addon itself stays `.ts`-only.

---

### Slice 3: Vue Storybook App

**Value**: Confirms cross-framework compatibility with Vue's Storybook renderer.

#### Tasks

1. **Scaffold the Vue app**
   - `apps/vue/package.json` with deps: `vue`, `storybook`, `@storybook/vue3-vite`
   - Workspace dep on `storybook-vrhythm: "workspace:*"`

2. **Configure Storybook**
   - `apps/vue/.storybook/main.ts`: framework `@storybook/vue3-vite`, register addon

3. **Create test stories**
   - Same three variants as React: `Default`, `WithPreset`, `Hidden`
   - Use a simple inline Vue template component

4. **Verify in CI**
   - `build-storybook` for the Vue app passes

#### Acceptance Criteria

- `turbo run build-storybook --filter=@apps/vue` succeeds
- Overlay renders correctly in local dev
- CI green

#### Specs

**`apps/vue/package.json`**

```jsonc
{
  "name": "@apps/vue",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6007 --no-open",
    "build-storybook": "storybook build",
  },
  "dependencies": {
    "vue": "^3.5.0",
  },
  "devDependencies": {
    "storybook": "^10.0.0",
    "@storybook/vue3-vite": "^10.0.0",
    "storybook-vrhythm": "workspace:*",
  },
}
```

**`apps/vue/.storybook/main.ts`**

```typescript
import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts)'],
  addons: ['storybook-vrhythm'],
  framework: '@storybook/vue3-vite',
};

export { config as default };
```

**`apps/vue/src/stories/Rhythm.stories.ts`**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent } from 'vue';

const RhythmBox = defineComponent({
  template: `<div style="padding: 32px; font-size: 16px; line-height: 24px;">
    Check the vertical rhythm overlay behind this box.
  </div>`,
});

const meta: Meta<typeof RhythmBox> = {
  title: 'VRhythm/Integration',
  component: RhythmBox,
};
export { meta as default };

export const Default: StoryObj<typeof RhythmBox> = {};

export const WithPreset: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { preset: 'tailwind' } },
};

export const Hidden: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { hide: true } },
};
```

---

### Slice 4: HTML Storybook App

**Value**: Validates the simplest integration path — pure HTML/Vite, no component framework.

#### Tasks

1. **Scaffold the HTML app**
   - `apps/html/package.json` with deps: `storybook`, `@storybook/html-vite`
   - Workspace dep on `storybook-vrhythm: "workspace:*"`
   - **Version note**: `@storybook/html-vite` may still be on 9.x; check npm at implementation time and pin to latest compatible version

2. **Configure Storybook**
   - `apps/html/.storybook/main.ts`: framework `@storybook/html-vite`, register addon

3. **Create test stories**
   - Same three variants, using plain DOM elements

4. **Verify in CI**

#### Acceptance Criteria

- `turbo run build-storybook --filter=@apps/html` succeeds
- Overlay renders correctly
- CI green

#### Specs

**`apps/html/package.json`**

```jsonc
{
  "name": "@apps/html",
  "private": true,
  "scripts": {
    "dev": "storybook dev -p 6008 --no-open",
    "build-storybook": "storybook build",
  },
  "devDependencies": {
    "storybook": "^10.0.0",
    "@storybook/html-vite": "^10.0.0",
    "storybook-vrhythm": "workspace:*",
  },
}
```

> If `@storybook/html-vite` 10.x is not published yet, use the latest 9.x and pin `storybook` to a compatible range in this app only.

**`apps/html/.storybook/main.ts`**

```typescript
import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts)'],
  addons: ['storybook-vrhythm'],
  framework: '@storybook/html-vite',
};

export { config as default };
```

**`apps/html/src/stories/Rhythm.stories.ts`**

```typescript
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'VRhythm/Integration',
  render: () => {
    const el = document.createElement('div');
    el.style.cssText = 'padding: 32px; font-size: 16px; line-height: 24px;';
    el.textContent = 'Check the vertical rhythm overlay behind this box.';
    return el;
  },
};
export { meta as default };

export const Default: StoryObj = {};

export const WithPreset: StoryObj = {
  parameters: { vrhythm: { preset: 'tailwind' } },
};

export const Hidden: StoryObj = {
  parameters: { vrhythm: { hide: true } },
};
```

---

### Slice 5: CI Pipeline with Turborepo Cache

**Value**: Fast CI with cached builds — unchanged packages skip entirely.

#### Tasks

1. **Update `.github/workflows/ci.yml`**
   - Use Turborepo's GitHub Actions cache
   - Run all tasks via `turbo run`
   - Keep Node 20 + 22 matrix

2. **Add `build-storybook` as a CI step**
   - Only for apps (not the addon package)
   - Use `turbo run build-storybook`

3. **Configure remote cache (optional)**
   - Vercel Remote Cache or self-hosted
   - Can defer to a later iteration

#### Specs

**`.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm turbo run lint test build --cache-dir=.turbo

      - run: pnpm turbo run build-storybook --cache-dir=.turbo

      - uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ runner.os }}-node${{ matrix.node-version }}-${{ github.sha }}
          restore-keys: |
            turbo-${{ runner.os }}-node${{ matrix.node-version }}-
```

---

### Slice 6 (Future): Svelte Storybook App

**Value**: Covers the fourth supported framework. Deferred because Svelte 5 + Storybook 10 integration may still be stabilizing.

#### Tasks

1. Scaffold `apps/svelte/` with `@storybook/svelte-vite`
2. Create test stories using Svelte 5 components
3. Add to CI pipeline

> **Not included in initial migration**. Add when `@storybook/svelte-vite` 10.x is confirmed stable.

---

## Implementation Order

```text
Slice 1 ──► Slice 2 ──► Slice 3 ──┐
                                    ├──► Slice 5
                        Slice 4 ──┘
```

- **Slice 1** is prerequisite for everything
- **Slices 2, 3, 4** can be done in any order after Slice 1 (shown sequential for review simplicity, but independent)
- **Slice 5** finalizes CI after at least one app exists (can start after Slice 2)
- **Slice 6** is deferred

## Risks and Mitigations

| Risk                                        | Impact                              | Mitigation                                                                  |
| ------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| `@storybook/html-vite` not on 10.x yet      | HTML app can't use latest Storybook | Pin to 9.x in that app only; Storybook supports mixed versions in monorepo  |
| Turborepo cache invalidation too aggressive | Slow CI                             | Tune `inputs` in `turbo.json` to exclude non-relevant files                 |
| pnpm workspace hoisting conflicts           | Build failures                      | Use `.npmrc` with `shamefully-hoist=false`, `strict-peer-dependencies=true` |
| Storybook build is slow in CI               | Long CI times                       | Turborepo cache handles repeat runs; first run ~2-3 min per app             |
| Framework-specific Storybook bugs           | False negatives in integration test | Pin Storybook minor versions in apps; update on a schedule                  |

## What This Does NOT Include

- **E2E visual testing** (Playwright/Chromatic) — can be added later per app
- **Publishing automation** (changesets) — addon publishing stays manual or in a future slice
- **Angular/Web Components apps** — low priority given the DOM-only nature of the addon
- **Storybook interaction tests** — build-storybook is a sufficient smoke test for now
