import type { Meta, StoryObj } from '@storybook/react-vite';
import { QuestionBody } from './QuestionBody';

const meta = {
  title: 'Components/QuestionBody',
  component: QuestionBody,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof QuestionBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …',
  },
};

export const WithTranslation: Story = {
  args: {
    text: 'In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …',
    textEn: 'In Germany, people are allowed to speak openly against the government because...',
    showTranslation: true,
  },
};

export const LongQuestion: Story = {
  args: {
    text: 'Welches Recht gehört zu den Grundrechten in Deutschland?',
    textEn: 'Which right belongs to the fundamental rights in Germany?',
    showTranslation: false,
  },
};

export const QuestionWithImage: Story = {
  args: {
    text: 'Was zeigt dieses Bild?',
    textEn: 'What does this image show?',
    imageUrl: './images/q55.png',
    imageText: '© Deutscher Bundestag/Achim Melde',
    showTranslation: false,
  },
};

export const QuestionWithImageAndTranslation: Story = {
  args: {
    text: 'Was zeigt dieses Bild?',
    textEn: 'What does this image show?',
    imageUrl: './images/q55.png',
    imageText: '© Deutscher Bundestag/Achim Melde',
    showTranslation: true,
  },
};

export const FourImageOptions: Story = {
  args: {
    text: 'Welches ist das Wappen der Bundesrepublik Deutschland?',
    textEn: 'Which is the coat of arms of the Federal Republic of Germany?',
    imageUrl: [
      './images/q21_1.png',
      './images/q21_2.png',
      './images/q21_3.png',
      './images/q21_4.png',
    ],
    showTranslation: false,
  },
};

export const FourImageOptionsWithTranslation: Story = {
  args: {
    text: 'Welches ist das Wappen der Bundesrepublik Deutschland?',
    textEn: 'Which is the coat of arms of the Federal Republic of Germany?',
    imageUrl: [
      './images/q21_1.png',
      './images/q21_2.png',
      './images/q21_3.png',
      './images/q21_4.png',
    ],
    showTranslation: true,
  },
};

export const WithQuestionIdGeneral: Story = {
  args: {
    text: 'In Deutschland dürfen Menschen offen etwas gegen die Regierung sagen, weil …',
    textEn: 'In Germany, people are allowed to speak openly against the government because...',
    showTranslation: false,
    questionId: 70,
    questionType: 'general',
  },
};

export const WithQuestionIdState: Story = {
  args: {
    text: 'Welches Wappen gehört zum Bundesland Bayern?',
    textEn: 'Which coat of arms belongs to the state of Bavaria?',
    showTranslation: true,
    questionId: 303,
    questionType: 'state',
    stateName: 'Bayern',
  },
};

export const WithQuestionIdLongStateName: Story = {
  args: {
    text: 'Welche Farben hat die Landesflagge von Baden-Württemberg?',
    textEn: 'What colors does the state flag of Baden-Württemberg have?',
    showTranslation: false,
    questionId: 307,
    questionType: 'state',
    stateName: 'Baden-Württemberg',
  },
};

export const WithQuestionIdAndImage: Story = {
  args: {
    text: 'Was zeigt dieses Bild?',
    textEn: 'What does this image show?',
    imageUrl: './images/q55.png',
    imageText: '© Deutscher Bundestag/Achim Melde',
    showTranslation: true,
    questionId: 55,
    questionType: 'general',
  },
};
