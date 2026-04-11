import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModeCard } from './ModeCard';

const meta = {
  title: 'Components/ModeCard',
  component: ModeCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    icon: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    Story => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ModeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Burger Test',
    description: 'Test your German citizenship knowledge',
    icon: '🍔',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Flash Cards',
    description: 'Memorize key facts with spaced repetition',
    icon: '🃏',
    disabled: true,
  },
};

export const CustomIcon: Story = {
  args: {
    title: 'Reading',
    description: 'Practice reading comprehension',
    icon: '📖',
  },
};
