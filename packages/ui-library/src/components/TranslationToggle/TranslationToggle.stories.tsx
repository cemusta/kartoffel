import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TranslationToggle } from './TranslationToggle';

const meta = {
  title: 'Components/TranslationToggle',
  component: TranslationToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
  },
} satisfies Meta<typeof TranslationToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: {
    checked: false,
    onChange: () => {},
  },
};

export const On: Story = {
  args: {
    checked: true,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <TranslationToggle checked={checked} onChange={setChecked} />;
  },
};
