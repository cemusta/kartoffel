import type { Meta, StoryObj } from '@storybook/react-vite';
import { FactCallout } from './FactCallout';

const meta = {
  title: 'Components/FactCallout',
  component: FactCallout,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    text: { control: 'text' },
    icon: { control: 'text' },
  },
  decorators: [
    Story => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FactCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Historically, the success rate is over 98%, as the questions are public and can be practiced in advance.',
  },
};

export const CustomIcon: Story = {
  args: {
    icon: '📌',
    text: 'The test consists of 33 questions and requires a minimum score of 17 to pass.',
  },
};
