import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { HomePage } from './HomePage';

const meta = {
  title: 'Pages/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBurgerTest: fn(),
    onLogout: fn(),
    onSettings: fn(),
    username: 'SwiftOtter42',
    version: '0.1.0',
  },
  argTypes: {
    username: { control: 'text' },
    version: { control: 'text' },
    onBurgerTest: { action: 'onBurgerTest' },
    onLogout: { action: 'onLogout' },
    onSettings: { action: 'onSettings' },
  },
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  args: {
    username: 'SwiftOtter42',
  },
};

export const NoUser: Story = {
  args: {
    username: null,
  },
};
