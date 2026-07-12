import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuestionOptions } from './QuestionOptions';

const meta = {
  title: 'Components/QuestionOptions',
  component: QuestionOptions,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
    text: { control: 'text' },
    textEn: { control: 'text' },
    isSelected: { control: 'boolean' },
    isCorrect: { control: 'boolean' },
    isRevealed: { control: 'boolean' },
    showTranslation: { control: 'boolean' },
  },
} satisfies Meta<typeof QuestionOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'A',
    text: 'hier Religionsfreiheit gilt.',
  },
};

export const WithTranslation: Story = {
  args: {
    label: 'D',
    text: 'hier Meinungsfreiheit gilt.',
    textEn: 'freedom of speech applies here.',
    showTranslation: true,
  },
};

export const Selected: Story = {
  args: {
    label: 'B',
    text: 'die Menschen Steuern zahlen.',
    isSelected: true,
  },
};

export const Correct: Story = {
  args: {
    label: 'D',
    text: 'hier Meinungsfreiheit gilt.',
    textEn: 'freedom of speech applies here.',
    isSelected: true,
    isCorrect: true,
    isRevealed: true,
    showTranslation: true,
  },
};

export const Incorrect: Story = {
  args: {
    label: 'A',
    text: 'hier Religionsfreiheit gilt.',
    textEn: 'freedom of religion applies here.',
    isSelected: true,
    isCorrect: false,
    isRevealed: true,
    showTranslation: true,
  },
};
