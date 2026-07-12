import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopBar } from './TopBar';

const meta = {
  title: 'Components/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    left: <span style={{ fontWeight: 700, fontSize: 20 }}>Kartoffel</span>,
  },
};

export const WithRight: Story = {
  args: {
    left: <span style={{ fontWeight: 700, fontSize: 20 }}>Kartoffel</span>,
    right: <span>@username</span>,
  },
};

export const WithBackButton: Story = {
  args: {
    left: (
      <>
        <button
          style={{
            width: 40,
            height: 40,
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 24,
          }}
          aria-label="Go back"
        >
          ‹
        </button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Burger Test</span>
      </>
    ),
  },
};
