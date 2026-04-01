import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      preview: 'src/preview.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    clean: true,
    sourcemap: true,
    treeshake: true,
    platform: 'browser',
    target: 'es2020',
    outExtension: () => ({ js: '.js' }),
  },
  {
    entry: { preset: 'src/preset.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: true,
    platform: 'node',
    target: 'node18',
    outExtension: () => ({ js: '.js' }),
  },
]);
