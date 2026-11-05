import { defineConfig } from 'tsdown';

const outExtensions = () => ({ js: '.js', dts: '.d.ts' });

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      preview: 'src/preview.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    platform: 'browser',
    target: 'es2020',
    outExtensions,
  },
  {
    entry: { preset: 'src/preset.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: true,
    platform: 'node',
    target: 'node22',
    outExtensions,
  },
]);
