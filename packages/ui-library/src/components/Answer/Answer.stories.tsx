import type { Meta, StoryObj } from '@storybook/react-vite';
import { Answer } from './Answer';

const meta = {
  title: 'Components/Answer',
  component: Answer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    imageUrl: { control: 'text' },
    isSelected: { control: 'boolean' },
    isCorrect: { control: 'boolean' },
    isRevealed: { control: 'boolean' },
  },
} satisfies Meta<typeof Answer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Paris',
  },
};

export const Selected: Story = {
  args: {
    text: 'Paris',
    isSelected: true,
  },
};

export const Correct: Story = {
  args: {
    text: 'Paris',
    isSelected: true,
    isCorrect: true,
    isRevealed: true,
  },
};

export const Incorrect: Story = {
  args: {
    text: 'London',
    isSelected: true,
    isCorrect: false,
    isRevealed: true,
  },
};

export const WithImage: Story = {
  args: {
    text: 'Cat',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
  },
};

export const OnlyImage: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200',
  },
};

export const ImageSelected: Story = {
  args: {
    text: 'Dog',
    imageUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200',
    isSelected: true,
  },
};

export const ImageCorrect: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
    isSelected: true,
    isCorrect: true,
    isRevealed: true,
  },
};
