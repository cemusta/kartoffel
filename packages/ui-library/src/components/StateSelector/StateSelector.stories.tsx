import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StateSelector } from './StateSelector';

const STATES = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
] as const;

const meta = {
  title: 'Components/StateSelector',
  component: StateSelector,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    states: STATES,
  },
} satisfies Meta<typeof StateSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: null },
};

export const WithValue: Story = {
  args: { value: 'Bayern' },
};

export const Interactive: Story = {
  args: { value: null },
  render: function Render(args) {
    const [value, setValue] = useState<string | null>(args.value);
    return (
      <StateSelector
        {...args}
        value={value}
        onChange={v => {
          setValue(v);
          args.onChange(v);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await userEvent.selectOptions(select, 'Bayern');
    await expect(args.onChange).toHaveBeenCalledWith('Bayern');
  },
};
