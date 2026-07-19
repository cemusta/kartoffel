import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockRecordQuizAnswers = vi.fn();
const mockBlocker = {
  state: 'unblocked' as const,
  proceed: vi.fn(),
  reset: vi.fn(),
};

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useBlocker: () => mockBlocker,
  };
});

vi.mock('@cemusta/burgertest', () => ({
  questions: [
    ...Array.from({ length: 300 }, (_, i) => ({
      id: i + 1,
      type: 'general',
      text: `Question ${i + 1}`,
      options: { a: 'A', b: 'B', c: 'C', d: 'D' },
      correctAnswer: 'a',
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      id: 301 + i,
      type: 'state',
      state: 'Bayern',
      text: `State Question ${i + 1}`,
      options: { a: 'A', b: 'B', c: 'C', d: 'D' },
      correctAnswer: 'a',
    })),
  ],
}));

vi.mock('@kartoffel/ui-library', () => ({
  PracticeQuizPage: ({
    questions,
    onBack,
    onComplete,
    onQuizStarted,
  }: {
    questions: { id: number }[];
    passingScore?: number;
    onBack?: () => void;
    onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
    onQuizStarted?: (started: boolean) => void;
  }) => (
    <div>
      <button onClick={onBack} aria-label="Go back">
        Back
      </button>
      <span data-testid="question-count">{questions.length}</span>
      <button onClick={() => onComplete?.(17, [1], [2])}>Finish</button>
      <button onClick={() => onQuizStarted?.(true)}>Start Quiz</button>
    </div>
  ),
}));

vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn(),
}));

import { useUser } from '../../hooks/useUser';
import { PracticeQuizScreen } from './PracticeQuizScreen';

describe('PracticeQuizScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      user: { version: 2, username: 'tester', createdAt: '', generalAnswers: {}, stateAnswers: {} },
      germanState: 'Bayern',
      questionAnswers: {},
      showGoogleSearch: true,
      createAnonymousUser: vi.fn(),
      clearUser: vi.fn(),
      setGermanState: vi.fn(),
      recordQuizAnswers: mockRecordQuizAnswers,
      clearProgress: vi.fn(),
      setShowGoogleSearch: vi.fn(),
      keepTranslationsOn: false,
      setKeepTranslationsOn: vi.fn(),
    });
  });

  it('renders 33 questions (30 general + 3 state)', () => {
    render(
      <MemoryRouter>
        <PracticeQuizScreen />
      </MemoryRouter>
    );
    expect(screen.getByTestId('question-count').textContent).toBe('33');
  });

  it('calls recordQuizAnswers with correct and incorrect ids on complete', () => {
    render(
      <MemoryRouter>
        <PracticeQuizScreen />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText('Finish'));
    expect(mockRecordQuizAnswers).toHaveBeenCalledWith([1], [2]);
  });

  it('calls navigate(-1) on back button click', () => {
    render(
      <MemoryRouter>
        <PracticeQuizScreen />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByLabelText('Go back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
