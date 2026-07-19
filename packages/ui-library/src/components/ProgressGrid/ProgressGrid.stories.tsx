import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressGrid } from './ProgressGrid';

const GENERAL_IDS = Array.from({ length: 300 }, (_, i) => i + 1);
const STATE_IDS = Array.from({ length: 10 }, (_, i) => 301 + i);
const ALL_IDS = [...GENERAL_IDS, ...STATE_IDS];

const meta = {
  title: 'Components/ProgressGrid',
  component: ProgressGrid,
  parameters: {
    layout: 'padded',
  },
  args: {
    allQuestionIds: ALL_IDS,
    stateQuestionIds: STATE_IDS,
    questionAnswers: {},
  },
} satisfies Meta<typeof ProgressGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: 'Empty — untouched',
  args: {
    questionAnswers: {},
  },
};

export const AfterFirstRound: Story = {
  name: 'After first round — all 5 states',
  args: {
    questionAnswers: {
      // mastered (dark green) — last 2 both correct
      1: [true, true], 2: [false, true, true], 3: [true, true], 50: [true, true],
      // correct (light green) — only 1 answer, correct
      4: [true], 5: [true], 6: [true], 100: [true],
      // mixed (yellow) — last 2 are different
      7: [true, false], 8: [false, true], 9: [true, false], 150: [true, false],
      // incorrect (light red) — only 1 answer, wrong
      10: [false], 11: [false], 12: [false], 200: [false],
      // struggling (dark red) — last 2 both wrong
      13: [false, false], 14: [true, false, false], 15: [false, false], 250: [false, false],
      // state questions with various states
      301: [true, true], 302: [true], 303: [false, false], 304: [true, false],
    },
  },
};

export const WellPracticed: Story = {
  name: 'Well practiced — mostly mastered',
  args: {
    questionAnswers: Object.fromEntries(
      ALL_IDS.map(id => [
        id,
        id % 5 === 0 ? [true, false] : id % 7 === 0 ? [true] : [true, true],
      ]),
    ),
  },
};

export const Struggling: Story = {
  name: 'Struggling — mostly dark red',
  args: {
    questionAnswers: Object.fromEntries(
      ALL_IDS.map(id => [
        id,
        id % 6 === 0 ? [true, false] : id % 8 === 0 ? [true] : [false, false],
      ]),
    ),
  },
};
