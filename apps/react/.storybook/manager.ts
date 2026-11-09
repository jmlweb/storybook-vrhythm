import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Matches the palette of the landing page in apps/site, which links here.
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'storybook-vrhythm',
    brandUrl: 'https://jmlweb.github.io/storybook-vrhythm/',
    brandTarget: '_self',

    colorPrimary: '#ec4899',
    colorSecondary: '#8b5cf6',

    appBg: '#0a0618',
    appContentBg: '#140c2e',
    appPreviewBg: '#f5f3ff',
    appBorderColor: 'rgba(196, 181, 253, 0.16)',
    appBorderRadius: 8,

    fontBase: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    fontCode: 'ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace',

    textColor: '#f5f3ff',
    textInverseColor: '#0a0618',
    textMutedColor: '#b9b1da',

    barBg: '#140c2e',
    barTextColor: '#b9b1da',
    barHoverColor: '#f472b6',
    barSelectedColor: '#f472b6',

    inputBg: '#1d1340',
    inputBorder: 'rgba(196, 181, 253, 0.24)',
    inputTextColor: '#f5f3ff',
    inputBorderRadius: 8,
  }),
});
