import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { expect, userEvent, within } from 'storybook/test';
import { RealExamQuizPage } from './RealExamQuizPage';
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
  title: 'Pages/RealExamQuizPage',
  component: RealExamQuizPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBack: fn(),
    onComplete: fn(),
    onReviewWrong: fn(),
    onQuizStarted: fn(),
    questions: sampleQuestions,
    passingScore: 2,
  },
  argTypes: {
    onBack: { action: 'onBack' },
    onComplete: { action: 'onComplete' },
    onReviewWrong: { action: 'onReviewWrong' },
    passingScore: { control: 'number' },
  },
} satisfies Meta<typeof RealExamQuizPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoTranslationVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Confirm first question is shown
    const q1 = await canvas.findByText(/Regierung/i);
    await expect(q1).toBeInTheDocument();

    // There should be no translation toggle
    const translationToggle = canvas.queryByRole('checkbox', { name: /translation/i });
    await expect(translationToggle).toBeNull();
  },
};

export const AnswerAndFinish: Story = {
  args: {
    questions: [sampleQuestions[0]],
    passingScore: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Finish button should start disabled
    const finishButton = await canvas.findByRole('button', { name: /finish exam/i });
    await expect(finishButton).toBeDisabled();

    // Select an answer (wrong one)
    const optionA = await canvas.findByText(/hier Religionsfreiheit gilt/i);
    await userEvent.click(optionA);

    // Finish button should now be enabled
    await expect(finishButton).not.toBeDisabled();

    // Click finish
    await userEvent.click(finishButton);

    // Results screen should appear
    const resultsTitle = await canvas.findByText(/Exam Complete/i);
    await expect(resultsTitle).toBeInTheDocument();

    // Score should be 0/1 (answered wrong)
    const score = await canvas.findByText(/Score: 0 \/ 1/i);
    await expect(score).toBeInTheDocument();
  },
};
