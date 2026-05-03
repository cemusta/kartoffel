import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { BurgerTestPage } from './BurgerTestPage';

const meta = {
  title: 'Pages/BurgerTestPage',
  component: BurgerTestPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
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
