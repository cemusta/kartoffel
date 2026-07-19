import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@kartoffel/ui-library', () => ({
  HomePage: ({
    username,
    onBurgerTest,
    onLogout,
  }: {
    username: string | null;
    onBurgerTest: () => void;
    onLogout: () => void;
    onSettings: () => void;
  }) => (
    <div>
      <span data-testid="username">{username ?? 'guest'}</span>
      <button onClick={onBurgerTest}>Burger test</button>
      <button onClick={onLogout}>Log out</button>
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
      user: { version: 2, username: 'batman', createdAt: '', generalAnswers: {}, stateAnswers: {} },
      germanState: null,
      questionAnswers: {},
      showGoogleSearch: true,
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
      setGermanState: vi.fn(),
      recordQuizAnswers: vi.fn(),
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      keepTranslationsOn: false,
      setKeepTranslationsOn: vi.fn(),
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
      germanState: null,
      questionAnswers: {},
      showGoogleSearch: true,
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
      setGermanState: vi.fn(),
      recordQuizAnswers: vi.fn(),
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      keepTranslationsOn: false,
      setKeepTranslationsOn: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByTestId('username').textContent).toBe('guest');
  });

  it('navigates to /einburger-test on burger test button click', () => {
    vi.mocked(useUser).mockReturnValue({
      user: { version: 2, username: 'batman', createdAt: '', generalAnswers: {}, stateAnswers: {} },
      germanState: null,
      questionAnswers: {},
      showGoogleSearch: true,
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
      setGermanState: vi.fn(),
      recordQuizAnswers: vi.fn(),
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      keepTranslationsOn: false,
      setKeepTranslationsOn: vi.fn(),
    });

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Burger test'));
    expect(mockNavigate).toHaveBeenCalledWith('/einburger-test');
  });

  it('calls clearUser and replaces location on logout', () => {
    const clearUser = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      user: { version: 2, username: 'batman', createdAt: '', generalAnswers: {}, stateAnswers: {} },
      germanState: null,
      questionAnswers: {},
      showGoogleSearch: true,
      createAnonymousUser: vi.fn(),
      clearUser,
      setGermanState: vi.fn(),
      recordQuizAnswers: vi.fn(),
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      keepTranslationsOn: false,
      setKeepTranslationsOn: vi.fn(),
    });

    const replaceSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      replace: vi.fn(),
    } as unknown as Location);
    const replaceFn = window.location.replace as ReturnType<typeof vi.fn>;

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Log out'));
    expect(clearUser).toHaveBeenCalledOnce();
    expect(replaceFn).toHaveBeenCalledWith('/');

    replaceSpy.mockRestore();
  });
});
