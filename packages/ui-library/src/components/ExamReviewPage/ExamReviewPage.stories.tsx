import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { expect, within } from 'storybook/test';
import { ExamReviewPage } from './ExamReviewPage';
import { QuestionData } from '../QuestionBody';

const wrongQuestions: QuestionData[] = [
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
    id: 5,
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

// The user's wrong selections for each question id
const userAnswers: Record<number, string> = {
  1: 'a', // user picked "Religionsfreiheit" instead of "Meinungsfreiheit"
  2: 'b', // user picked "Recht auf Wohnung" instead of "Meinungsfreiheit"
  5: 'd', // user picked "Geschäftsordnung" instead of "Verfassung"
};

const meta = {
  title: 'Pages/ExamReviewPage',
  component: ExamReviewPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    questions: wrongQuestions,
    userAnswers,
    onBack: fn(),
  },
  argTypes: {
    onBack: { action: 'onBack' },
  },
} satisfies Meta<typeof ExamReviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleWrongQuestion: Story = {
  args: {
    questions: [wrongQuestions[0]],
    userAnswers: { 1: 'b' },
  },
};

export const ShowsWrongAndCorrect: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Hint text should be visible
    const hint = await canvas.findByText(/Your selection is shown in red/i);
    await expect(hint).toBeInTheDocument();

    // First question should be rendered
    const q1 = await canvas.findByText(/Regierung/i);
    await expect(q1).toBeInTheDocument();

    // Wrong answers count in title
    const title = await canvas.findByText(/Wrong Answers/i);
    await expect(title).toBeInTheDocument();
  },
};
