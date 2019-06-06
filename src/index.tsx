import { makeDecorator } from '@storybook/addons';

import getStyle from './getStyle';
import { StyleProps, ConfigProps } from './types';
import { injectStyle, removeElement } from './utils';

type Params = StyleProps & ConfigProps;

export default makeDecorator({
  name: 'withVRhythm',
  parameterName: 'vrhythm',
  wrapper: (getStory, context, { parameters }: { parameters: Params }) => {
    if (parameters.hide) {
      removeElement();
    } else {
      const style = getStyle(parameters);
      injectStyle(style);
    }
    return getStory(context);
  },
});
