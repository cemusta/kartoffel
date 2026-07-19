import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { expect, userEvent, within } from 'storybook/test';
import { ExamQuestionContainer } from './ExamQuestionContainer';
import { QuestionData } from '../QuestionBody';

const sampleQuestions: QuestionData[] = [
  {
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
  },
  {
    id: 2,
    type: 'general',
    text: 'Welches Recht gehört zu den Grundrechten in Deutschland?',
    options: {
      a: 'das Recht auf Arbeit',
      b: 'das Recht auf Wohnung',
      c: 'die Meinungsfreiheit',
      d: 'das Recht auf ein Auto',
    },
    correctAnswer: 'c',
  },
  {
    id: 3,
    type: 'general',
    text: 'Was ist das Grundgesetz?',
    options: {
      a: 'die Verfassung Deutschlands',
      b: 'ein Schulbuch',
      c: 'ein Gesetzbuch für Steuern',
      d: 'eine Geschäftsordnung des Bundestags',
    },
    correctAnswer: 'a',
  },
];

const meta = {
  title: 'Containers/ExamQuestionContainer',
  component: ExamQuestionContainer,
  parameters: {
    layout: 'centered',
  },
  args: {
    questions: sampleQuestions,
    passingScore: 2,
    onComplete: fn(),
    onReviewWrong: fn(),
    onExamStarted: fn(),
  },
  argTypes: {
    onComplete: { action: 'onComplete' },
    onReviewWrong: { action: 'onReviewWrong' },
    onExamStarted: { action: 'onExamStarted' },
    passingScore: { control: 'number' },
  },
} satisfies Meta<typeof ExamQuestionContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleQuestion: Story = {
  args: {
    questions: [sampleQuestions[0]],
    passingScore: 1,
  },
};

export const SelectAndNavigate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click the first answer option
    const optionA = await canvas.findByText(/hier Religionsfreiheit/i);
    await userEvent.click(optionA);

    // Timer and answered count should update
    const answeredCount = await canvas.findByText(/1 \/ 3 answered/i);
    await expect(answeredCount).toBeInTheDocument();

    // Navigate to next question via Next button
    const nextButton = await canvas.findByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    // Second question should be visible
    const q2 = await canvas.findByText(/Grundrechten/i);
    await expect(q2).toBeInTheDocument();
  },
};

export const FinishExamDisabledUntilAllAnswered: Story = {
  args: {
    questions: [sampleQuestions[0]],
    passingScore: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Finish button should be disabled initially
    const finishButton = await canvas.findByRole('button', { name: /finish exam/i });
    await expect(finishButton).toBeDisabled();

    // Answer the question
    const optionD = await canvas.findByText(/hier Meinungsfreiheit gilt/i);
    await userEvent.click(optionD);

    // Now Finish should be enabled
    await expect(finishButton).not.toBeDisabled();
  },
};
