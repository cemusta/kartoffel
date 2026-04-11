import type { Meta, StoryObj } from '@storybook/react';
import { QuestionContainer } from './QuestionContainer';
import { QuestionData } from '../Question';

const meta = {
  title: 'Components/QuestionContainer',
  component: QuestionContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QuestionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleQuestions: QuestionData[] = [
  {
    id: 1,
    text: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
  },
  {
    id: 2,
    text: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
  },
  {
    id: 3,
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
  },
  {
    id: 4,
    text: 'Who painted the Mona Lisa?',
    options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Rembrandt'],
    correctAnswer: 'Da Vinci',
  },
];

export const Default: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};

export const SingleQuestion: Story = {
  args: {
    questions: [sampleQuestions[0]],
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};

export const WithImages: Story = {
  args: {
    questions: [
      {
        id: 1,
        text: 'What animal is this?',
        imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
        options: ['Dog', 'Cat', 'Rabbit', 'Fox'],
        correctAnswer: 'Cat',
      },
      {
        id: 2,
        text: 'Which flag belongs to France?',
        options: [
          { imageUrl: 'https://flagcdn.com/w80/gb.png', text: 'UK' },
          { imageUrl: 'https://flagcdn.com/w80/fr.png', text: 'France' },
          { imageUrl: 'https://flagcdn.com/w80/de.png', text: 'Germany' },
          { imageUrl: 'https://flagcdn.com/w80/it.png', text: 'Italy' },
        ],
        correctAnswer: { imageUrl: 'https://flagcdn.com/w80/fr.png', text: 'France' },
      },
    ],
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};
