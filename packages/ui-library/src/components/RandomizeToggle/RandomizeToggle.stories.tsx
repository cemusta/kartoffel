import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RandomizeToggle } from './RandomizeToggle';

const meta = {
  title: 'Components/RandomizeToggle',
  component: RandomizeToggle,
  parameters: {
    layout: 'centered',
  },
  args: {
    checked: false,
    onChange: fn(),
  },
  argTypes: {
    checked: { control: 'boolean' },
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof RandomizeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};
