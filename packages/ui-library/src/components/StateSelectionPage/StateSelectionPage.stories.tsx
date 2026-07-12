import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StateSelectionPage } from './StateSelectionPage';

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
  title: 'Pages/StateSelectionPage',
  component: StateSelectionPage,
  parameters: { layout: 'fullscreen' },
  args: {
    onContinue: fn(),
    onBack: fn(),
    states: STATES,
  },
} satisfies Meta<typeof StateSelectionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { initialState: null },
};

export const WithInitialState: Story = {
  args: { initialState: 'Bayern' },
};

export const Interactive: Story = {
  args: { initialState: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    const continueBtn = canvas.getByRole('button', { name: 'Continue' });

    await expect(continueBtn).toBeDisabled();

    await userEvent.selectOptions(select, 'Berlin');
    await expect(continueBtn).not.toBeDisabled();

    await userEvent.click(continueBtn);
    await expect(args.onContinue).toHaveBeenCalledWith('Berlin');
  },
};
