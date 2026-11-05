import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['storybook-vrhythm', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
};

export { config as default };
