import { TextInput } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Component/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    radius: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    label: 'Label',
    size: 'sm',
    radius: 'md',
  },
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="mx-auto grid h-[90vh] max-w-[23.25rem] place-items-center">
      <TextInput {...args} />
    </div>
  ),
  args: {
    label: 'Name',
    size: 'sm',
    radius: 'md',
  },
};
