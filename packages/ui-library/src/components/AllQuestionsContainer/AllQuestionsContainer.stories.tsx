import type { Meta, StoryObj } from '@storybook/react-vite';
import { AllQuestionsContainer } from './AllQuestionsContainer';
import type { QuestionData } from '../Question';

const meta = {
  title: 'Containers/AllQuestionsContainer',
  component: AllQuestionsContainer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AllQuestionsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    translations: {
      en: {
        text: 'Which right belongs to the fundamental rights in Germany?',
        options: {
          a: 'the right to work',
          b: 'the right to housing',
          c: 'freedom of opinion',
          d: 'the right to a car',
        },
      },
    },
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
    translations: {
      en: {
        text: 'What is the Basic Law (Grundgesetz)?',
        options: {
          a: 'the constitution of Germany',
          b: 'a school textbook',
          c: 'a tax law book',
          d: 'the rules of procedure of the Bundestag',
        },
      },
    },
  },
];

export const Default: Story = {
  args: {
    questions: sampleQuestions,
    style: { maxHeight: '600px' },
  },
};

export const SingleQuestion: Story = {
  args: {
    questions: [sampleQuestions[0]],
  },
};
