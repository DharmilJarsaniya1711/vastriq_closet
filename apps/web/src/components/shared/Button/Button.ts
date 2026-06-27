import { Button } from '@mantine/core';

const ExtendedButton = Button.extend({
  defaultProps: {
    fw: 500,
    lh: '1.25rem',
    px: '1rem',
    radius: 'md',
  },
  vars(theme, props, _ctx) {
    if (props.size === 'sm' || props.size === undefined) {
      return {
        root: {
          '--button-height': '2.5rem',
        },
      };
    }

    return {
      root: {},
    };
  },
});

export default ExtendedButton;
