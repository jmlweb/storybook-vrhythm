import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the site from /storybook-vrhythm/, so URLs stay relative.
  base: './',
  server: { port: 6010 },
});
