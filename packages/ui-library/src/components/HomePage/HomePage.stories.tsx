import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomePage } from './HomePage';

const meta = {
  title: 'Pages/HomePage',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    username: { control: 'text' },
    onBurgerTest: { action: 'onBurgerTest' },
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
