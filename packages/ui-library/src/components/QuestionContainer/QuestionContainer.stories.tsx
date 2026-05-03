import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { QuestionContainer } from './QuestionContainer';
import type { QuestionData } from '../QuestionBody';

const meta = {
  title: 'Containers/QuestionContainer',
  component: QuestionContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QuestionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleQuestion: QuestionData = {
  id: 1,
  type: 'general',
  text: 'In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …',
  options: {
    a: 'hier Religionsfreiheit gilt.',
    b: 'die Menschen Steuern zahlen.',
    c: 'die Menschen das Wahlrecht haben.',
    d: 'hier Meinungsfreiheit gilt.',
  },
  correctAnswer: 'd',
  translations: {
    en: {
      text: 'In Germany, people are allowed to speak openly against the government because...',
      options: {
        a: 'freedom of religion applies here.',
        b: 'people pay taxes.',
        c: 'people have the right to vote.',
        d: 'freedom of expression applies here.',
      },
      context:
        'Freedom of expression is a fundamental right in Germany, allowing you to share your opinions and criticize the government without fear.',
    },
  },
};

function Wrapper(args: React.ComponentProps<typeof QuestionContainer>) {
  const [selected, setSelected] = useState<string | null>(null);
  return <QuestionContainer {...args} selectedAnswer={selected} onSelect={setSelected} />;
}

export const Default: Story = {
  render: args => <Wrapper {...args} />,
  args: {
    question: sampleQuestion,
    selectedAnswer: null,
    isRevealed: false,
    showTranslation: false,
    onSelect: () => {},
  },
};

export const Revealed: Story = {
  args: {
    question: sampleQuestion,
    selectedAnswer: 'b',
    isRevealed: true,
    showTranslation: false,
    onSelect: () => {},
  },
};

export const WithTranslation: Story = {
  render: args => <Wrapper {...args} />,
  args: {
    question: sampleQuestion,
    selectedAnswer: null,
    isRevealed: false,
    showTranslation: true,
    onSelect: () => {},
  },
};
