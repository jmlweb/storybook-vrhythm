import preview from '../../../.storybook/preview';
import { Block } from './fixtures';

// No play functions: the addon's afterEach runs the audit and fails the test.
const meta = preview.meta({
  title: 'VRhythm/Audit/AutoAudit',
  component: Block,
  args: { top: 16, height: 24 },
  parameters: { layout: 'fullscreen', vrhythm: { preset: '8px' } },
});

export { meta as default };

export const ErrorMode = meta.story({
  parameters: { vrhythm: { audit: 'error' } },
});

export const ErrorModeWithHiddenOverlay = meta.story({
  parameters: { vrhythm: { audit: 'error', hide: true } },
});

export const TodoMode = meta.story({
  args: { top: 21, height: 19 },
  parameters: { vrhythm: { audit: 'todo' } },
});
