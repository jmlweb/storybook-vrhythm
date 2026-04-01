# Storybook Decorators Reference (SB 10)

## What is a Decorator?

A decorator wraps a story in extra rendering functionality. Used to add markup, provide context/data, or inject side effects without modifying the component.

## Decorator Signature

```typescript
import type {
  Renderer,
  PartialStoryFn as StoryFunction,
  StoryContext,
} from 'storybook/internal/types';

const myDecorator = (
  StoryFn: StoryFunction<Renderer>,
  context: StoryContext<Renderer>
) => {
  // ... logic
  return StoryFn();
};
```

## Context Object

The `context` parameter provides:

| Property     | Type   | Description                                  |
| ------------ | ------ | -------------------------------------------- |
| `args`       | object | Story arguments (passed as component props)  |
| `argTypes`   | object | Arg type definitions and controls config     |
| `globals`    | object | Global state (toolbar values, theme, etc.)   |
| `hooks`      | object | Storybook hooks (useArgs, useGlobals)        |
| `parameters` | object | Static metadata (e.g., `parameters.vrhythm`) |
| `viewMode`   | string | `'story'` or `'docs'`                        |
| `id`         | string | Story ID                                     |

## Scope Levels

### Story-Level

```typescript
export const Primary: Story = {
  decorators: [(Story) => <div style={{ margin: '3em' }}><Story /></div>],
};
```

### Component-Level (Meta)

```typescript
const meta = {
  component: Button,
  decorators: [(Story) => <div style={{ margin: '3em' }}><Story /></div>],
} satisfies Meta<typeof Button>;
```

### Global (Preview)

```typescript
// .storybook/preview.ts or addon preview.ts
const preview: Preview = {
  decorators: [(Story) => <div style={{ margin: '3em' }}><Story /></div>],
};
export default preview;
```

## Execution Order

1. Global decorators (in definition order)
2. Component decorators (in definition order)
3. Story decorators (innermost first, working outwards)

## Using Hooks in Decorators

```typescript
import { useEffect, useGlobals } from 'storybook/preview-api';

export const withMyFeature = (StoryFn, context) => {
  const [globals] = useGlobals();
  const isActive = globals['my-param'] === true;

  useEffect(() => {
    if (isActive) {
      // inject styles, modify DOM, etc.
    }
    return () => {
      // cleanup
    };
  }, [isActive]);

  return StoryFn();
};
```

## Reading Parameters

```typescript
export const withFeature = (StoryFn, context) => {
  const config = context.parameters?.myAddon;
  // config comes from story's `parameters.myAddon` field
  return StoryFn();
};
```

## Reading Globals (Toolbar State)

```typescript
export const withFeature = (StoryFn, context) => {
  const isEnabled = context.globals?.myAddon === true;
  // or use the hook:
  // const [globals] = useGlobals();
  // const isEnabled = globals.myAddon === true;
  return StoryFn();
};
```

## Non-JSX Decorators (Pure DOM)

For addons that manipulate the DOM directly (no React/JSX), the decorator can operate as a plain function:

```typescript
export const withOverlay = (StoryFn, context) => {
  const params = context.parameters?.overlay;
  const isVisible = context.globals?.overlay !== false;

  if (isVisible) {
    injectOverlayElement(params);
  } else {
    removeOverlayElement();
  }

  return StoryFn();
};
```

This pattern works across all frameworks (React, Vue, Angular, Svelte, etc.) since it doesn't depend on any framework-specific rendering.
