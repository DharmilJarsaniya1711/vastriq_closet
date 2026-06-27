import { StylesRecord, TextInput, TextInputFactory } from '@mantine/core';

import { cn } from '@/utils/helper';

const ExtendedTextInput = TextInput.extend({
  defaultProps: {
    radius: 'md',
    size: 'sm',
  },
  classNames(_theme, props) {
    const classNames = props.classNames as StylesRecord<TextInputFactory['stylesNames'], string>;

    return {
      ...classNames,
      root: cn('w-full', classNames?.root),
      wrapper: cn('group', classNames?.wrapper),
      label: cn('mb-2', classNames?.label),
      section: cn('', classNames?.section),
      input: cn('', classNames?.input),
      error: cn('text-[0.8rem] text-danger leading-4', classNames?.error),
      description: cn('text-sm font-medium', classNames?.description),
    };
  },
});

export default ExtendedTextInput;
