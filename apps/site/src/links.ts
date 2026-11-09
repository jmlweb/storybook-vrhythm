const REPO = 'https://github.com/jmlweb/storybook-vrhythm';
const PACKAGE_PATH = 'main/packages/storybook-vrhythm';

export const Links = {
  // Relative on purpose: the Storybook build is deployed next to this page.
  STORYBOOK: './storybook/',
  REPO,
  NPM: 'https://www.npmjs.com/package/storybook-vrhythm',
  REFERENCE: `${REPO}/blob/${PACKAGE_PATH}/docs/reference.md`,
  LLMS_TXT: `${REPO}/blob/${PACKAGE_PATH}/llms.txt`,
  SKILL: `${REPO}/tree/${PACKAGE_PATH}/skills/storybook-vrhythm`,
  LICENSE: `${REPO}/blob/main/LICENSE`,
} as const;

export const INSTALL_COMMAND = 'npx storybook add storybook-vrhythm@next';
