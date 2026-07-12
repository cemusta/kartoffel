import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { QuizQuestionContainer } from './QuizQuestionContainer';
import { QuestionData } from '../QuestionBody';

const meta = {
  title: 'Containers/QuizQuestionContainer',
  component: QuizQuestionContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof QuizQuestionContainer>;

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
          'Freedom of expression is a fundamental right in Germany, allowing you to share your opinions and criticize the government without fear. It is a cornerstone of a healthy democracy where every voice matters!',
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
        text: 'Was zeigt dieses Bild?',
        imageText: '© Deutscher Bundestag/Achim Melde',
        image: './images/q55.png',
        options: {
          a: 'den Bundestagssitz in Berlin',
          b: 'das Bundesverfassungsgericht in Karlsruhe',
          c: 'das Bundesratsgebäude in Berlin',
          d: 'das Bundeskanzleramt in Berlin',
        },
        correctAnswer: 'a',
        translations: {
          en: {
            text: 'What does this image show?',
            options: {
              a: 'the seat of the Bundestag in Berlin',
              b: 'the Federal Constitutional Court in Karlsruhe',
              c: 'the Bundesrat building in Berlin',
              d: 'the Federal Chancellery in Berlin',
            },
            context:
              "The Reichstag building in Berlin is the seat of the Bundestag, where Germany's elected representatives meet to pass laws. Its famous glass dome symbolizes transparency in government. Interestingly, the dome allows citizens to literally look down upon the politicians at work!",
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
        image: [
          './images/q21_1.png',
          './images/q21_2.png',
          './images/q21_3.png',
          './images/q21_4.png',
        ],
        options: { a: 'Bild 1', b: 'Bild 2', c: 'Bild 3', d: 'Bild 4' },
        correctAnswer: 'a',
        translations: {
          en: {
            text: 'Which is the coat of arms of the Federal Republic of Germany?',
            options: { a: 'Image 1', b: 'Image 2', c: 'Image 3', d: 'Image 4' },
            context:
              'The Federal Eagle (Bundesadler) is the official national symbol of Germany, representing strength and sovereignty. Interestingly, the eagle has been used as a symbol in German-speaking lands for centuries!',
          },
        },
      },
    ],
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
};

export const RandomizedOptions: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
    randomizeOptions: true,
  },
};

export const WithNavigation: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that we're on question 1
    await expect(canvas.getByText(/Question 1 of 3/i)).toBeInTheDocument();

    // Previous button should not exist on first question
    expect(canvas.queryByText(/Previous Question/i)).not.toBeInTheDocument();

    // Select an answer for question 1 by finding the button with the option text
    const option1 = canvas.getByRole('button', { name: /hier Meinungsfreiheit gilt/i });
    await userEvent.click(option1);

    // Check the answer
    const checkButton = canvas.getByText(/Check Answer/i);
    await userEvent.click(checkButton);

    // Move to next question
    const nextButton = canvas.getByText(/Next Question/i);
    await userEvent.click(nextButton);

    // Check we're on question 2
    await expect(canvas.getByText(/Question 2 of 3/i)).toBeInTheDocument();

    // Previous button should now be visible
    await expect(canvas.getByText(/Previous Question/i)).toBeInTheDocument();

    // Select an answer for question 2
    const option2 = canvas.getByRole('button', { name: /die Meinungsfreiheit/i });
    await userEvent.click(option2);

    // Check the answer
    await userEvent.click(canvas.getByText(/Check Answer/i));

    // Go back to question 1
    const previousButton = canvas.getByText(/Previous Question/i);
    await userEvent.click(previousButton);

    // Verify we're back on question 1
    await expect(canvas.getByText(/Question 1 of 3/i)).toBeInTheDocument();

    // Verify the answer is still selected and revealed
    const selectedOption = canvas.getByRole('button', { name: /hier Meinungsfreiheit gilt/i });
    // The button should have the selected class
    await expect(selectedOption).toBeInTheDocument();

    // The "Next Question" button should be visible (since it was already revealed)
    await expect(canvas.getByText(/Next Question/i)).toBeInTheDocument();
  },
};

export const WithKeyboardShortcuts: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that we're on question 1
    await expect(canvas.getByText(/Question 1 of 3/i)).toBeInTheDocument();

    // Select answer D using keyboard shortcut '4'
    await userEvent.keyboard('4');

    // Verify answer D is selected (hier Meinungsfreiheit gilt)
    const option4 = canvas.getByRole('button', { name: /hier Meinungsfreiheit gilt/i });
    await expect(option4).toBeInTheDocument();

    // Check answer using Enter key
    await userEvent.keyboard('{Enter}');

    // Verify the answer was checked (Next Question button appears)
    await expect(canvas.getByText(/Next Question/i)).toBeInTheDocument();

    // Navigate to next question using right arrow
    await userEvent.keyboard('{ArrowRight}');

    // Check we're on question 2
    await expect(canvas.getByText(/Question 2 of 3/i)).toBeInTheDocument();

    // Select answer C (die Meinungsfreiheit) using keyboard shortcut '3'
    await userEvent.keyboard('3');

    // Check using Enter
    await userEvent.keyboard('{Enter}');

    // Navigate back using left arrow
    await userEvent.keyboard('{ArrowLeft}');

    // Verify we're back on question 1
    await expect(canvas.getByText(/Question 1 of 3/i)).toBeInTheDocument();

    // Try toggling translation with 'T' key
    await userEvent.keyboard('t');

    // The translation should now be visible in the question body
    await expect(
      canvas.getByText(/In Germany, people are allowed to speak openly against the government/i)
    ).toBeInTheDocument();

    // Toggle translation off
    await userEvent.keyboard('t');

    // Try showing fact with 'F' key
    await userEvent.keyboard('f');

    // Fact modal should be visible
    await expect(
      canvas.getByText(/Freedom of expression is a fundamental right in Germany/i)
    ).toBeInTheDocument();
  },
};

export const WithNewQuestionBadge: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
    correctQuestionIds: [],
    incorrectQuestionIds: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify the "New" badge is displayed
    await expect(canvas.getByText(/New/i)).toBeInTheDocument();
    await expect(canvas.getByText(/✨/)).toBeInTheDocument();
  },
};

export const WithCorrectQuestionBadge: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
    correctQuestionIds: [1], // First question was answered correctly
    incorrectQuestionIds: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify the "Correct" badge is displayed
    await expect(canvas.getByText(/Correct/i)).toBeInTheDocument();
    await expect(canvas.getByText(/✓/)).toBeInTheDocument();
  },
};

export const WithWrongQuestionBadge: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
    correctQuestionIds: [],
    incorrectQuestionIds: [1], // First question was answered incorrectly
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Verify the "Wrong" badge is displayed
    await expect(canvas.getByText(/Wrong/i)).toBeInTheDocument();
    await expect(canvas.getByText(/✗/)).toBeInTheDocument();
  },
};

export const WithMixedQuestionStatuses: Story = {
  args: {
    questions: sampleQuestions,
    onComplete: score => console.log('Quiz completed! Score:', score),
    correctQuestionIds: [1], // First question correct
    incorrectQuestionIds: [2], // Second question wrong, third is new
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Question 1 should show "Correct" badge
    await expect(canvas.getByText(/Question 1 of 3/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Correct/i)).toBeInTheDocument();
    
    // Select an answer and move to next question
    const option = canvas.getByRole('button', { name: /hier Meinungsfreiheit gilt/i });
    await userEvent.click(option);
    await userEvent.click(canvas.getByText(/Check Answer/i));
    await userEvent.click(canvas.getByText(/Next Question/i));
    
    // Question 2 should show "Wrong" badge
    await expect(canvas.getByText(/Question 2 of 3/i)).toBeInTheDocument();
    await expect(canvas.getByText(/Wrong/i)).toBeInTheDocument();
    
    // Move to question 3
    const option2 = canvas.getByRole('button', { name: /die Meinungsfreiheit/i });
    await userEvent.click(option2);
    await userEvent.click(canvas.getByText(/Check Answer/i));
    await userEvent.click(canvas.getByText(/Next Question/i));
    
    // Question 3 should show "New" badge
    await expect(canvas.getByText(/Question 3 of 3/i)).toBeInTheDocument();
    await expect(canvas.getByText(/New/i)).toBeInTheDocument();
  },
};


