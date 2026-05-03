import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { HamburgerMenu } from './HamburgerMenu';

const meta = {
  title: 'Components/HamburgerMenu',
  component: HamburgerMenu,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    onLogout: fn(),
    onSettings: fn(),
  },
} satisfies Meta<typeof HamburgerMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithUser: Story = {
  args: { username: 'potato_king' },
};

export const WithoutUser: Story = {
  args: { username: null },
};

export const OpenMenu: Story = {
  args: { username: 'potato_king' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(btn);
    await expect(canvas.getByRole('menu')).toBeInTheDocument();
    await expect(canvas.getByText('potato_king')).toBeInTheDocument();
    await expect(canvas.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
    await expect(canvas.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  },
};

export const SettingsClick: Story = {
  args: { username: 'potato_king' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Settings' }));
    await expect(args.onSettings).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

export const LogoutClick: Story = {
  args: { username: 'potato_king' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Log out' }));
    await expect(args.onLogout).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
  },
};

export const OpenMenuNoUser: Story = {
  args: { username: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    await expect(canvas.getByRole('menu')).toBeInTheDocument();
    await expect(canvas.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  },
};
