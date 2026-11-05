---
"storybook-vrhythm": major
---

Add Storybook 11 support alongside Storybook 10. The `storybook` peer range is now `^10.0.0 || ^11.0.0-0`.

The package now has a default export for CSF Next. Register it with `definePreview({ addons: [vrhythm()] })`. Registering the addon in `.storybook/main.ts` and using the named `withVRhythm` decorator both keep working.

**Breaking:** require Node 22.12 or later, the minimum for Storybook 11.
