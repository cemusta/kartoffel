import type { Meta, StoryObj } from '@storybook/react-vite';
import { Question } from './Question';

const meta = {
  title: 'Components/Question',
  component: Question,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Question>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'What is the capital of France?',
  },
};

export const LongQuestion: Story = {
  args: {
    text: 'Which of the following best describes the primary function of mitochondria in eukaryotic cells?',
  },
};

export const ShortQuestion: Story = {
  args: {
    text: 'What is 2 + 2?',
  },
};

export const QuestionWithImage: Story = {
  args: {
    text: 'What animal is shown in this image?',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
  },
};

export const OnlyImage: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400',
  },
};
