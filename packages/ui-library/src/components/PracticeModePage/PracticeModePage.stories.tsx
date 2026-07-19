import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { expect, userEvent, within } from 'storybook/test';
import { PracticeModePage } from './PracticeModePage';
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
];

const meta = {
  title: 'Pages/PracticeModePage',
  component: PracticeModePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBack: fn(),
    onAnswer: fn(),
    question: sampleQuestions[0],
    keepTranslationsOn: false,
    showGoogleSearch: true,
    randomizeOptions: false,
  },
  argTypes: {
    onBack: { action: 'onBack' },
    onAnswer: { action: 'onAnswer' },
  },
} satisfies Meta<typeof PracticeModePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewQuestion: Story = {
  args: {
    questionAnswers: {},
  },
};

export const PreviouslyWrong: Story = {
  args: {
    question: sampleQuestions[0],
    questionAnswers: { 1: [false] },
  },
};

export const PreviouslyCorrect: Story = {
  args: {
    question: sampleQuestions[0],
    questionAnswers: { 1: [true] },
  },
};

export const WithTranslationsOn: Story = {
  args: {
    keepTranslationsOn: true,
  },
};

export const SecondQuestion: Story = {
  args: {
    question: sampleQuestions[1],
  },
};

export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for the question to appear
    const question = await canvas.findByText(/Was ist die Hauptstadt/i);
    await expect(question).toBeInTheDocument();

    // Select an answer option
    const optionA = await canvas.findByText('Berlin');
    await userEvent.click(optionA);

    // Click check answer button
    const checkButton = await canvas.findByRole('button', { name: /check answer/i });
    await userEvent.click(checkButton);

    // Next Question button should appear
    const nextButton = await canvas.findByRole('button', { name: /next question/i });
    await expect(nextButton).toBeInTheDocument();
  },
};

export const AnswerAndAdvance: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Select correct answer (Berlin = option a)
    const optionA = await canvas.findByText('Berlin');
    await userEvent.click(optionA);

    // Check answer
    const checkButton = await canvas.findByRole('button', { name: /check answer/i });
    await userEvent.click(checkButton);

    // Click Next — triggers onAnswer callback
    const nextButton = await canvas.findByRole('button', { name: /next question/i });
    await userEvent.click(nextButton);
  },
};
