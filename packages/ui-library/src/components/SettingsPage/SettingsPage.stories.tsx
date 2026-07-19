import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SettingsPage } from './SettingsPage';

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
  title: 'Pages/SettingsPage',
  component: SettingsPage,
  parameters: { layout: 'fullscreen' },
  args: {
    username: 'SwiftOtter42',
    onStateChange: fn(),
    onBack: fn(),
    onLogout: fn(),
    onSettings: fn(),
    onClearProgress: fn(),
    states: STATES,
    showGoogleSearch: true,
    onShowGoogleSearchChange: fn(),
    keepTranslationsOn: false,
    onKeepTranslationsOnChange: fn(),
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithState: Story = {
  args: { selectedState: 'Bayern' },
};

export const NoStateSelected: Story = {
  args: { selectedState: null },
};

export const Interactive: Story = {
  args: { selectedState: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await userEvent.selectOptions(select, 'Hamburg');
    await expect(args.onStateChange).toHaveBeenCalledWith('Hamburg');
  },
};
