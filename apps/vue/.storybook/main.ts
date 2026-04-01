import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts)'],
  addons: ['storybook-vrhythm'],
  framework: '@storybook/vue3-vite',
};

export { config as default };
