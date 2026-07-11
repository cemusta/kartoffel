import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { expect, userEvent, within } from 'storybook/test';
import { PracticeQuizPage } from './PracticeQuizPage';
import { QuestionData } from '../QuestionBody';

const sampleQuestions: QuestionData[] = [
  {
    id: 1,
    type: 'general',
    text: 'Was ist die Hauptstadt von Deutschland?',
    options: {
      a: 'Berlin',
      b: 'München',
      c: 'Hamburg',
      d: 'Frankfurt',
    },
    correctAnswer: 'a',
    translations: {
      en: {
        text: 'What is the capital of Germany?',
        options: {
          a: 'Berlin',
          b: 'Munich',
          c: 'Hamburg',
          d: 'Frankfurt',
        },
        context: 'Berlin has been the capital since reunification in 1990.',
      },
    },
  },
  {
    id: 2,
    type: 'general',
    text: 'Wann wurde das Grundgesetz der Bundesrepublik Deutschland verkündet?',
    options: {
      a: '1945',
      b: '1949',
      c: '1955',
      d: '1990',
    },
    correctAnswer: 'b',
    translations: {
      en: {
        text: 'When was the Basic Law of the Federal Republic of Germany proclaimed?',
        options: {
          a: '1945',
          b: '1949',
          c: '1955',
          d: '1990',
        },
        context: 'The Basic Law was adopted on May 23, 1949.',
      },
    },
  },
  {
    id: 3,
    type: 'general',
    text: 'Wie viele Bundesländer hat Deutschland?',
    options: {
      a: '12',
      b: '14',
      c: '16',
      d: '18',
    },
    correctAnswer: 'c',
  },
];

const meta = {
  title: 'Pages/PracticeQuizPage',
  component: PracticeQuizPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onBack: fn(),
    onComplete: fn(),
    questions: sampleQuestions,
    passingScore: 2,
    title: 'Practice Quiz',
  },
  argTypes: {
    onBack: { action: 'onBack' },
    onComplete: { action: 'onComplete' },
    title: { control: 'text' },
    passingScore: { control: 'number' },
  },
} satisfies Meta<typeof PracticeQuizPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: {
    title: 'Final Exam',
  },
};

export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the first question to appear
    const firstQuestion = await canvas.findByText(/Was ist die Hauptstadt/i);
    await expect(firstQuestion).toBeInTheDocument();

    // Click an answer option
    const optionA = await canvas.findByText(/Berlin/i);
    await userEvent.click(optionA);

    // Wait a bit for selection to register
    await new Promise(resolve => setTimeout(resolve, 100));

    // Click check answer button
    const checkButton = await canvas.findByRole('button', { name: /check answer/i });
    await userEvent.click(checkButton);

    // The option should be revealed as correct
    await expect(canvas.getByText(/Berlin/i)).toBeInTheDocument();
  },
};
