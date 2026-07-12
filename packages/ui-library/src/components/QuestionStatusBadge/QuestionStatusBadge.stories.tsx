import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { QuestionStatusBadge } from './QuestionStatusBadge';

const meta = {
  title: 'Components/QuestionStatusBadge',
  component: QuestionStatusBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['new', 'correct', 'wrong'],
    },
  },
} satisfies Meta<typeof QuestionStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  args: {
    status: 'new',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify both label and icon are present
    await expect(canvas.getByText('New')).toBeInTheDocument();
    await expect(canvas.getByText('✨')).toBeInTheDocument();
  },
};

export const Correct: Story = {
  args: {
    status: 'correct',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify both label and icon are present
    await expect(canvas.getByText('Correct')).toBeInTheDocument();
    await expect(canvas.getByText('✓')).toBeInTheDocument();
  },
};

export const Wrong: Story = {
  args: {
    status: 'wrong',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify both label and icon are present
    await expect(canvas.getByText('Wrong')).toBeInTheDocument();
    await expect(canvas.getByText('✗')).toBeInTheDocument();
  },
};

export const AllStatuses: Story = {
  args: {
    status: 'new',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <QuestionStatusBadge status="new" />
      <QuestionStatusBadge status="correct" />
      <QuestionStatusBadge status="wrong" />
    </div>
  ),
};
