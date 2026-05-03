import type { Meta, StoryObj } from '@storybook/react-vite';
import { Question } from './Question';

const meta = {
  title: 'Components/Question',
  component: Question,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Question>;

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
    imageUrl: '/images/q55.png',
    imageText: '© Deutscher Bundestag/Achim Melde',
    showTranslation: false,
  },
};

export const QuestionWithImageAndTranslation: Story = {
  args: {
    text: 'Was zeigt dieses Bild?',
    textEn: 'What does this image show?',
    imageUrl: '/images/q55.png',
    imageText: '© Deutscher Bundestag/Achim Melde',
    showTranslation: true,
  },
};

export const FourImageOptions: Story = {
  args: {
    text: 'Welches ist das Wappen der Bundesrepublik Deutschland?',
    textEn: 'Which is the coat of arms of the Federal Republic of Germany?',
    imageUrl: ['/images/q21_1.png', '/images/q21_2.png', '/images/q21_3.png', '/images/q21_4.png'],
    showTranslation: false,
  },
};

export const FourImageOptionsWithTranslation: Story = {
  args: {
    text: 'Welches ist das Wappen der Bundesrepublik Deutschland?',
    textEn: 'Which is the coat of arms of the Federal Republic of Germany?',
    imageUrl: ['/images/q21_1.png', '/images/q21_2.png', '/images/q21_3.png', '/images/q21_4.png'],
    showTranslation: true,
  },
};
