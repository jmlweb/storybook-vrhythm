# Storybook Addon API Reference (SB 10)

## Addon Types

| Type   | Purpose                     | Registration |
| ------ | --------------------------- | ------------ |
| TOOL   | Toolbar buttons             | `manager.ts` |
| PANEL  | Addon panel (bottom/right)  | `manager.ts` |
| TAB    | Custom canvas tab           | `manager.ts` |
| Preset | Build/preview configuration | `preset.js`  |

## Preset API

### previewAnnotations

Registers preview entries (decorators, globals):

```javascript
// preset.js (root level)
export const previewAnnotations = [import.meta.resolve('./dist/preview')];
```

### managerEntries

Registers manager entries (toolbar, panels, tabs):

```javascript
// preset.js (root level)
export const managerEntries = [import.meta.resolve('./dist/manager')];
```

### Builder Hooks

```typescript
// Only for addons that modify build config
export const webpackFinal = (config, options) => {
  /* ... */ return config;
};
export const viteFinal = (config, options) => {
  /* ... */ return config;
};
export const babelDefault = (config) => {
  /* ... */ return config;
};
```

## Preview Annotations

```typescript
// src/preview.ts
import type { Renderer, ProjectAnnotations } from 'storybook/internal/types';

const preview: ProjectAnnotations<Renderer> = {
  decorators: [myDecorator],
  globals: {
    myParam: defaultValue,
  },
};

export default preview;
```

### Key Fields

| Field        | Purpose                                           |
| ------------ | ------------------------------------------------- |
| `decorators` | Array of decorator functions                      |
| `globals`    | Default global values (replaces `initialGlobals`) |
| `parameters` | Default parameters for all stories                |
| `argTypes`   | Default argType definitions                       |

## Manager Registration

```typescript
// src/manager.ts
import { addons, types } from 'storybook/manager-api';

addons.register('addon-id', () => {
  addons.add('addon-id/tool', {
    type: types.TOOL,
    title: 'My Tool',
    match: ({ tabId, viewMode }) => !tabId && viewMode === 'story',
    render: MyToolComponent,
  });
});
```

### Addon Registration Options

| Property | Type        | Description                    |
| -------- | ----------- | ------------------------------ |
| `type`   | `types.*`   | TOOL, PANEL, or TAB            |
| `title`  | `string`    | Display name                   |
| `match`  | `function`  | When to show (viewMode, tabId) |
| `render` | `Component` | React component to render      |

## Manager API Hooks

```typescript
import { useGlobals, useStorybookApi } from 'storybook/manager-api';

// Read/write globals
const [globals, updateGlobals] = useGlobals();
updateGlobals({ myParam: newValue });

// Access Storybook API
const api = useStorybookApi();
api.setAddonShortcut(ADDON_ID, {
  /* ... */
});
```

## Preview API Hooks

```typescript
import { useGlobals, useEffect, useMemo } from 'storybook/preview-api';

// Read globals in decorators
const [globals] = useGlobals();
```

## Type Imports

```typescript
// Types
import type {
  Renderer,
  PartialStoryFn,
  StoryContext,
  ProjectAnnotations,
} from 'storybook/internal/types';

// UI Components
import { ToggleButton, AddonPanel } from 'storybook/internal/components';

// Icons
import { GridIcon, EyeIcon } from '@storybook/icons';
```

## Decorator Signature

```typescript
type Decorator = (
  StoryFn: PartialStoryFn<Renderer>,
  context: StoryContext<Renderer>
) => ReturnType<PartialStoryFn<Renderer>>;
```

## Globals vs Parameters

| Concept      | Scope          | Mutable | Use Case                    |
| ------------ | -------------- | ------- | --------------------------- |
| `globals`    | All stories    | Yes     | Toolbar toggles, theme      |
| `parameters` | Per-story/meta | No      | Static config, addon params |

## package.json for Addons

```json
{
  "name": "storybook-my-addon",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./manager": "./dist/manager.mjs",
    "./preview": "./dist/preview.mjs",
    "./preset": "./dist/preset.js",
    "./package.json": "./package.json"
  },
  "peerDependencies": {
    "storybook": "^10.0.0"
  },
  "keywords": ["storybook-addon"],
  "storybook": {
    "displayName": "My Addon",
    "supportedFrameworks": [
      "react",
      "vue",
      "angular",
      "svelte",
      "web-components"
    ]
  },
  "bundler": {
    "exportEntries": ["src/index.ts"],
    "managerEntries": ["src/manager.ts"],
    "previewEntries": ["src/preview.ts"]
  }
}
```

## DOM Helpers Pattern

```typescript
import { global } from '@storybook/global';

export const addStyles = (id: string, css: string) => {
  const existing = global.document.getElementById(id);
  if (existing) {
    existing.innerHTML = css;
  } else {
    const style = global.document.createElement('style');
    style.setAttribute('id', id);
    style.innerHTML = css;
    global.document.head.appendChild(style);
  }
};

export const removeStyles = (id: string) => {
  const el = global.document.getElementById(id);
  if (el?.parentElement) {
    el.parentElement.removeChild(el);
  }
};
```
