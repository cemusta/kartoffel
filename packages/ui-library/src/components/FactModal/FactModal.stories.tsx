import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FactModal } from './FactModal';

const meta = {
  title: 'Components/FactModal',
  component: FactModal,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FactModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const EXAMPLE_FACT =
  'Freedom of expression is a fundamental right in Germany, allowing you to share your opinions and criticize the government without fear. It is a cornerstone of a healthy democracy where every voice matters!';

export const Default: Story = {
  args: {
    fact: EXAMPLE_FACT,
    onDismiss: () => {},
  },
};

export const Interactive: Story = {
  args: {
    fact: EXAMPLE_FACT,
    onDismiss: () => {},
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: '2rem' }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            borderRadius: '8px',
            border: '2px solid #1a73e8',
            background: 'white',
            color: '#1a73e8',
          }}
        >
          Show Fact
        </button>
        {open && <FactModal fact={EXAMPLE_FACT} onDismiss={() => setOpen(false)} />}
      </div>
    );
  },
};
