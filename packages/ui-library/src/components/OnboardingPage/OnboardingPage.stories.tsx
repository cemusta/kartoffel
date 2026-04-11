import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { OnboardingPage } from './OnboardingPage';

const meta = {
  title: 'Pages/OnboardingPage',
  component: OnboardingPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onContinueAnonymous: fn(),
  },
  argTypes: {
    onContinueAnonymous: { action: 'onContinueAnonymous' },
    logoSrc: { control: 'text' },
  },
} satisfies Meta<typeof OnboardingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logoSrc: 'https://placehold.co/140x140/e8f0fe/1a73e8?text=🥔',
  },
};

export const NoLogo: Story = {
  args: {
    logoSrc: '/nonexistent.png',
  },
};
