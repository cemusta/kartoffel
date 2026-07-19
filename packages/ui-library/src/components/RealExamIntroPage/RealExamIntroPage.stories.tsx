import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RealExamIntroPage } from './RealExamIntroPage';

const meta = {
  title: 'Pages/RealExamIntroPage',
  component: RealExamIntroPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    seed: 'AB3K9',
    shareUrl: 'http://localhost:3000/burger-test/real-exam/AB3K9',
    onBack: fn(),
    onStart: fn(),
    onChangeSeed: fn(),
  },
  argTypes: {
    seed: { control: 'text' },
    shareUrl: { control: 'text' },
    onBack: { action: 'onBack' },
    onStart: { action: 'onStart' },
    onChangeSeed: { action: 'onChangeSeed' },
  },
} satisfies Meta<typeof RealExamIntroPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongSeed: Story = {
  args: {
    seed: 'XZ99W',
    shareUrl: 'http://localhost:3000/burger-test/real-exam/XZ99W',
  },
};
