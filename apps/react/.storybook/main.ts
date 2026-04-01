import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['storybook-vrhythm'],
  framework: '@storybook/react-vite',
};

export { config as default };
