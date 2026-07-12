import type { Meta, StoryObj } from '@storybook/react-vite';
import { FactCallout } from './FactCallout';

const SAMPLE_FACTS = [
  'Historically, the success rate is over 98%, as the questions are public and can be practiced in advance.',
  'To pass, you need to answer at least 17 of 33 questions correctly.',
  'The test has 33 questions total — some are tailored to your specific German state.',
  'The complete question catalog is publicly available, so you can study every possible question in advance.',
  'The Einbürgerungstest has been mandatory for German citizenship applicants since September 2008.',
  'Each test session lasts up to 60 minutes.',
  'The test fee is €25 per attempt, regardless of how many times you take it.',
  'Tests are administered at local Volkshochschulen (VHS) — Germany\'s adult education centers.',
];

const meta = {
  title: 'Components/FactCallout',
  component: FactCallout,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    icon: { control: 'text' },
  },
  decorators: [
    Story => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FactCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    facts: SAMPLE_FACTS,
  },
};

export const SingleFact: Story = {
  args: {
    facts: ['The Einbürgerungstest has been mandatory for German citizenship applicants since September 2008.'],
  },
};

export const CustomIcon: Story = {
  args: {
    icon: '📌',
    facts: SAMPLE_FACTS,
  },
};
