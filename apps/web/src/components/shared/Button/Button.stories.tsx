import { Icon } from '@iconify-icon/react';
import { Button } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Component/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['default', 'filled', 'light', 'outline', 'subtle', 'transparent', 'white'],
    },
    color: {
      control: 'radio',
      options: ['primary', 'gray', 'danger', 'success'],
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    radius: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    children: 'string',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const Template: Story = {
  render: ({ ...args }) => (
    <div className="flex flex-wrap gap-2">
      <Button {...args}>Button</Button>
      <Button {...args} disabled>
        Button
      </Button>
      <Button {...args} loading>
        Button
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="filled">
        Filled
      </Button>
      <Button {...args} variant="light">
        Light
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="subtle">
        Subtle
      </Button>
      <Button {...args} variant="transparent">
        Transparent
      </Button>
      <Button {...args} variant="white">
        White
      </Button>
    </div>
  ),
  args: {
    children: 'Button',
  },
};

export const Default: Story = {
  ...Template,
  args: {
    variant: 'default',
    children: 'Button',
    color: 'primary',
  },
};

export const Filled: Story = {
  ...Template,
  args: {
    variant: 'filled',
    children: 'Button',
  },
};

export const Outlined: Story = {
  ...Template,
  args: {
    variant: 'outline',
    color: 'primary.7',
    bg: 'white',
    children: 'Button',
  },
};

export const White: Story = {
  ...Template,
  args: {
    variant: 'white',
    children: 'Button',
  },
  parameters: {},
};

export const FullWidth: Story = {
  render: (args) => (
    <div className="w-96">
      <Button {...args}>Button</Button>
    </div>
  ),
  args: {
    variant: 'filled',
    children: 'Button',
    fullWidth: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Button',
    leftSection: <Icon icon="tabler:plus" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Button',
    rightSection: <Icon icon="tabler:plus" />,
  },
};
