# Storybook 9 & 10 Migration Guide (Addon-Relevant Changes)

## Package Consolidation (Storybook 9)

All `@storybook/*` sub-packages were consolidated into the monolithic `storybook` package.

### Import Path Changes

| Before (SB 8)                                  | After (SB 9+)                   |
| ---------------------------------------------- | ------------------------------- |
| `@storybook/types`                             | `storybook/internal/types`      |
| `@storybook/addons` / `@storybook/manager-api` | `storybook/manager-api`         |
| `@storybook/preview-api`                       | `storybook/preview-api`         |
| `@storybook/components`                        | `storybook/internal/components` |
| `@storybook/global`                            | `@storybook/global` (unchanged) |
| `@storybook/icons`                             | `@storybook/icons` (unchanged)  |

### Type Imports

```typescript
// SB 8
import type { DecoratorFunction } from '@storybook/types';
import type { ProjectAnnotations, Renderer } from '@storybook/types';

// SB 9+/10
import type {
  Renderer,
  PartialStoryFn,
  StoryContext,
} from 'storybook/internal/types';
import type { ProjectAnnotations } from 'storybook/internal/types';
```

> **Note**: `DecoratorFunction` may no longer be the canonical type. Modern addons use
> `(StoryFn: PartialStoryFn<Renderer>, context: StoryContext<Renderer>) => ReturnType<PartialStoryFn<Renderer>>`
> or simply type the decorator inline.

### Preview API Hooks

```typescript
// SB 9+/10
import { useEffect, useMemo, useGlobals } from 'storybook/preview-api';
```

### Manager API

```typescript
// SB 9+/10
import {
  addons,
  types,
  useGlobals,
  useStorybookApi,
} from 'storybook/manager-api';
```

---

## Storybook 10 Breaking Changes

### ESM-Only Distribution

- `.storybook/main.js|ts` and all presets **must be valid ESM**
- Node.js **20.19+ or 22.12+** required
- CommonJS configurations no longer work

### Preset Root-Level File

```javascript
// SB 8 (preset.ts)
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
export function previewAnnotations(entry = []) {
  return [...entry, join(dir, 'preview.js')];
}

// SB 10 (preset.js)
export const previewAnnotations = [import.meta.resolve('./dist/preview')];
export const managerEntries = [import.meta.resolve('./dist/manager')];
```

### Preview Annotations

```typescript
// SB 8
import type { ProjectAnnotations, Renderer } from '@storybook/types';
const preview: ProjectAnnotations<Renderer> = {
  decorators: [withMyDecorator],
  globalTypes: {
    myParam: { description: '...', toolbar: { ... } },
  },
  initialGlobals: {
    myParam: true,
  },
};

// SB 10
import type { Renderer, ProjectAnnotations } from 'storybook/internal/types';
const preview: ProjectAnnotations<Renderer> = {
  decorators: [withMyDecorator],
  globals: {
    myParam: false,
  },
};
```

> **Note**: In SB 10, toolbar registration is done in `manager.ts` via `addons.register()`,
> not via `globalTypes` in preview. `globals` replaces `initialGlobals` for setting default values.

### Toolbar Registration (SB 10 Pattern)

Toolbars are now registered in a **manager entry** (not via `globalTypes` in preview):

```typescript
// src/manager.ts
import { addons, types } from 'storybook/manager-api';
import { ToggleButton } from 'storybook/internal/components';

addons.register('my-addon', () => {
  addons.add('my-addon/toolbar', {
    title: 'My Tool',
    type: types.TOOL,
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: ({ active }) => (
      <ToggleButton pressed={active} tooltip="Toggle feature">
        <SomeIcon />
      </ToggleButton>
    ),
  });
});
```

### package.json Changes

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "node": "./dist/index.js",
      "require": "./dist/index.js",
      "import": "./dist/index.mjs"
    },
    "./manager": "./dist/manager.mjs",
    "./preview": "./dist/preview.mjs",
    "./package.json": "./package.json"
  },
  "bundler": {
    "exportEntries": ["src/index.ts"],
    "managerEntries": ["src/manager.ts"],
    "previewEntries": ["src/preview.ts"]
  },
  "devDependencies": {
    "storybook": "^10.0.0"
  }
}
```

> **Note**: `@storybook/types` is no longer needed as a devDependency.
> Use `storybook` directly.

---

## Decorator Patterns (SB 10)

### Inline Decorator (Preview)

```typescript
import type {
  Renderer,
  PartialStoryFn as StoryFunction,
  StoryContext,
} from 'storybook/internal/types';
import { useEffect, useMemo, useGlobals } from 'storybook/preview-api';

export const withMyDecorator = (
  StoryFn: StoryFunction<Renderer>,
  context: StoryContext<Renderer>
) => {
  const [globals] = useGlobals();
  const isActive = [true, 'true'].includes(globals['my-param']);

  useEffect(() => {
    if (isActive) {
      // apply side effects
    }
    return () => {
      // cleanup
    };
  }, [isActive]);

  return StoryFn();
};
```

### Context Properties

The second argument (`context`) provides:

- `args` — story arguments
- `argTypes` — arg type definitions
- `globals` — global state (toolbar toggles, etc.)
- `hooks` — Storybook hooks (`useArgs`, `useGlobals`)
- `parameters` — static story metadata (e.g., `parameters.vrhythm`)
- `viewMode` — `'story'` or `'docs'`

---

## Addon File Structure (SB 10)

```text
src/
  index.ts          # Public API exports
  constants.ts      # ADDON_ID, PARAM_KEY, etc.
  manager.ts        # Manager entry (toolbar UI registration)
  preview.ts        # Preview entry (decorators, globals)
  withDecorator.ts  # Decorator implementation
  helpers.ts        # DOM utilities
preset.js           # Root preset (previewAnnotations, managerEntries)
```

---

## Automatic Migration

```bash
npx storybook@latest upgrade
```

This handles most changes automatically. For addons, manual review of imports and preset protocol is usually needed.
