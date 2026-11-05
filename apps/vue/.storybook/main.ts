import { defineMain } from '@storybook/vue3-vite/node';

export default defineMain({
  stories: ['../src/**/*.stories.@(ts)'],
  framework: '@storybook/vue3-vite',
});
