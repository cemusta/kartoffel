import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppFooter } from './AppFooter';

const meta = {
  title: 'Components/AppFooter',
  component: AppFooter,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    version: { control: 'text' },
  },
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    version: '0.2.1',
  },
};
