import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@cemusta/burgertest', () => ({
  questions: [],
}));

vi.mock('@kartoffel/ui-library', () => ({
  BurgerTestPage: ({
    onBack,
    onLogout,
  }: {
    onBack: () => void;
    username: string | null;
    onLogout: () => void;
    onSettings?: () => void;
    onShowAllQuestions: () => void;
    onStartPractice?: () => void;
    userState: string | null;
    allQuestionIds?: number[];
    correctQuestionIds?: number[];
    incorrectQuestionIds?: number[];
  }) => (
    <div>
      <button onClick={onBack}>Back</button>
      <button onClick={onLogout}>Log out</button>
    </div>
  ),
}));

vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '../../hooks/useUser';
import { BurgerTestScreen } from './BurgerTestScreen';

describe('BurgerTestScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      user: { username: 'batman', createdAt: '' },
      germanState: null,
      correctQuestionIds: [],
      incorrectQuestionIds: [],
      showGoogleSearch: true,
      keepTranslationsOn: false,
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
      setGermanState: vi.fn(),
      recordQuizAnswers: vi.fn(),
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      setKeepTranslationsOn: vi.fn(),
    });
  });

  it('renders burger test content', () => {
    render(
      <MemoryRouter>
        <BurgerTestScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('Back')).toBeTruthy();
  });

  it('calls navigate(-1) on back button click', () => {
    render(
      <MemoryRouter>
        <BurgerTestScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('calls clearUser and replaces location on logout', () => {
    const clearUser = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      user: { username: 'batman', createdAt: '' },
      germanState: null,
      correctQuestionIds: [],
      incorrectQuestionIds: [],
      showGoogleSearch: true,
      keepTranslationsOn: false,
      createAnonymousUser: vi.fn(),
      clearUser,
      setGermanState: vi.fn(),
      recordQuizAnswers: vi.fn(),
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      setKeepTranslationsOn: vi.fn(),
    });

    const replaceSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      replace: vi.fn(),
    } as unknown as Location);
    const replaceFn = window.location.replace as ReturnType<typeof vi.fn>;

    render(
      <MemoryRouter>
        <BurgerTestScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Log out'));
    expect(clearUser).toHaveBeenCalledOnce();
    expect(replaceFn).toHaveBeenCalledWith('/');

    replaceSpy.mockRestore();
  });
});
