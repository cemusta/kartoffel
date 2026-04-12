import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@kartoffel/ui-library', () => ({
  HomePage: ({ username, onBurgerTest }: { username: string | null; onBurgerTest: () => void }) => (
    <div>
      <span data-testid="username">{username ?? 'guest'}</span>
      <button onClick={onBurgerTest}>Burger test</button>
    </div>
  ),
}));

vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '../../hooks/useUser';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders username from user state', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { username: 'batman', createdAt: '' },
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByTestId('username').textContent).toBe('batman');
  });

  it('renders guest when user is null', () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByTestId('username').textContent).toBe('guest');
  });

  it('navigates to /burger-test on burger test button click', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { username: 'batman', createdAt: '' },
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Burger test'));
    expect(mockNavigate).toHaveBeenCalledWith('/burger-test');
  });
});
