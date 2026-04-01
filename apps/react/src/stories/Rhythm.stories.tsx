import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const RhythmBox = () => (
  <div style={{ padding: 32, fontSize: 16, lineHeight: '24px' }}>
    Check the vertical rhythm overlay behind this box.
  </div>
);

const meta: Meta<typeof RhythmBox> = {
  title: 'VRhythm/Integration',
  component: RhythmBox,
};
export { meta as default };

export const Default: StoryObj<typeof RhythmBox> = {};

export const WithPreset: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { preset: 'tailwind' } },
};

export const Hidden: StoryObj<typeof RhythmBox> = {
  parameters: { vrhythm: { hide: true } },
};
