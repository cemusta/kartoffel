import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserBadge } from './UserBadge';

const meta = {
  title: 'Components/UserBadge',
  component: UserBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    username: { control: 'text' },
  },
} satisfies Meta<typeof UserBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    username: 'SwiftOtter42',
  },
};

export const ShortName: Story = {
  args: {
    username: 'BoldFox11',
  },
};

export const LongName: Story = {
  args: {
    username: 'FiercePelican99',
  },
};
