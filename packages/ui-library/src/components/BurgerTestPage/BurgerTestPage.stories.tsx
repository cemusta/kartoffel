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
    username: 'SwiftOtter42',
  },
  argTypes: {
    onBack: { action: 'onBack' },
    onLogout: { action: 'onLogout' },
    username: { control: 'text' },
  },
} satisfies Meta<typeof BurgerTestPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
