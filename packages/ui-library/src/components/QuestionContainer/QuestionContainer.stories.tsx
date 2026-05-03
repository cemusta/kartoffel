import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuestionContainer } from './QuestionContainer';
import { QuestionData } from '../Question';

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
          d: 'freedom of speech applies here.',
        },
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
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};

export const SingleQuestion: Story = {
  args: {
    questions: [sampleQuestions[0]],
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};

export const WithImage: Story = {
  args: {
    questions: [
      {
        id: 55,
        type: 'general',
        text: 'Was zeigt dieses Bild? © Deutscher Bundestag/Achim Melde',
        image: '/images/q55.png',
        options: {
          a: 'den Bundestagssitz in Berlin',
          b: 'das Bundesverfassungsgericht in Karlsruhe',
          c: 'das Bundesratsgebäude in Berlin',
          d: 'das Bundeskanzleramt in Berlin',
        },
        correctAnswer: 'a',
        translations: {
          en: {
            text: 'What does this image show? © German Bundestag/Achim Melde',
            options: {
              a: 'the Bundestag building in Berlin',
              b: 'the Federal Constitutional Court in Karlsruhe',
              c: 'the Bundesrat building in Berlin',
              d: 'the Federal Chancellery in Berlin',
            },
          },
        },
      },
    ],
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};

export const FourImageOptions: Story = {
  args: {
    questions: [
      {
        id: 21,
        type: 'general',
        text: 'Welches ist das Wappen der Bundesrepublik Deutschland?',
        image: ['/images/q21_1.png', '/images/q21_2.png', '/images/q21_3.png', '/images/q21_4.png'],
        options: { a: 'Bild 1', b: 'Bild 2', c: 'Bild 3', d: 'Bild 4' },
        correctAnswer: 'a',
        translations: {
          en: {
            text: 'Which one is the coat of arms of the Federal Republic of Germany?',
            options: { a: 'Image 1', b: 'Image 2', c: 'Image 3', d: 'Image 4' },
          },
        },
      },
    ],
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};
