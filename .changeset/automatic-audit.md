---
'storybook-vrhythm': minor
---

Add `parameters.vrhythm.audit` (`'error'`, `'todo'`, `'off'`) and `auditOptions` to audit every story with no `play` function. `'error'` fails the story, so the result reaches Vitest and `@storybook/addon-mcp`.
