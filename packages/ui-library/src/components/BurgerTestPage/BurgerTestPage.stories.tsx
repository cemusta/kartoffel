import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BurgerTestPage } from './BurgerTestPage';

const GENERAL_IDS = Array.from({ length: 300 }, (_, i) => i + 1);
const BERLIN_IDS = Array.from({ length: 10 }, (_, i) => 301 + i);
const ALL_IDS = [...GENERAL_IDS, ...BERLIN_IDS];

const meta = {
  title: 'Pages/BurgerTestPage',
  component: BurgerTestPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBack: fn(),
    onLogout: fn(),
    onSettings: fn(),
    onShowAllQuestions: fn(),
    username: 'SwiftOtter42',
    userState: null,
  },
  argTypes: {
    onBack: { action: 'onBack' },
    onLogout: { action: 'onLogout' },
    onSettings: { action: 'onSettings' },
    onShowAllQuestions: { action: 'onShowAllQuestions' },
    username: { control: 'text' },
    userState: { control: 'text' },
  },
} satisfies Meta<typeof BurgerTestPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { userState: null },
};

export const WithState: Story = {
  args: { userState: 'Bayern' },
};

export const WithProgressV2: Story = {
  name: 'With Progress (v2 answer history)',
  args: {
    userState: 'Berlin',
    allQuestionIds: ALL_IDS,
    stateQuestionIds: BERLIN_IDS,
    onStartPractice: fn(),
    onStartRealExam: fn(),
    questionAnswers: {
      // mastered (dark green)
      62: [true, true], 14: [true, true], 85: [false, true, true], 163: [true, true],
      109: [true, true], 235: [true, true], 104: [true, true], 264: [true, true],
      2: [true, true], 25: [true, true], 192: [true, true], 66: [true, true],
      // correct (light green)
      326: [true], 196: [true], 141: [true], 126: [true], 291: [true],
      233: [true], 298: [true], 75: [true],
      // struggling (dark red)
      42: [false, false], 244: [false, false], 217: [false, false], 130: [false, false],
      102: [false, false], 33: [false, false], 226: [false, false], 279: [false, false],
      68: [false, false], 84: [false, false],
      // incorrect (light red)
      282: [false], 125: [false], 152: [false], 276: [false], 74: [false],
      178: [false], 162: [false], 212: [false], 43: [false],
      // mixed (yellow)
      197: [true, false], 108: [false, true], 328: [true, false], 323: [false, true],
    },
  },
};

