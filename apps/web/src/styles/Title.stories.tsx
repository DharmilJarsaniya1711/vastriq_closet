import { Title } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Component/Title',
  component: Title,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    order: {
      control: 'radio',
      options: [1, 2, 3, 4, 5, 6],
    },
  },
} satisfies Meta<typeof Title>;

export default meta;

type Story = StoryObj<typeof meta>;

const AllTitles: Story = {
  render: (args) => (
    <div>
      <Title {...args} order={1}>
        Heading 1
      </Title>
      <Title {...args} order={2}>
        Heading 2
      </Title>
      <Title {...args} order={3}>
        Heading 3
      </Title>
      <Title {...args} order={4}>
        Heading 4
      </Title>
      <Title {...args} order={5}>
        Heading 5
      </Title>
      <Title {...args} order={6}>
        Heading 6
      </Title>
    </div>
  ),
};

export const H1: Story = {
  args: {
    children: 'Heading 1',
    order: 1,
  },
};

export const H2: Story = {
  args: {
    children: 'Heading 2',
    order: 2,
  },
};

export const H3: Story = {
  args: {
    children: 'Heading 3',
    order: 3,
  },
};

export const H4: Story = {
  args: {
    children: 'Heading 4',
    order: 4,
  },
};

export const H5: Story = {
  args: {
    children: 'Heading 5',
    order: 5,
  },
};

export const H6: Story = {
  args: {
    children: 'Heading 6',
    order: 6,
  },
};

export const All: Story = AllTitles;
