import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts)'],
  addons: ['storybook-vrhythm'],
  framework: '@storybook/html-vite',
};

export { config as default };
