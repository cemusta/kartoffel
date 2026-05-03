import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockCreateAnonymousUser = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@kartoffel/ui-library', () => ({
  OnboardingPage: ({ onContinueAnonymous }: { onContinueAnonymous: () => void }) => (
    <button onClick={onContinueAnonymous}>Continue anonymous</button>
  ),
}));

vi.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    user: null,
    createAnonymousUser: mockCreateAnonymousUser,
    clearUser: vi.fn(),
  }),
}));

import { OnboardingScreen } from './OnboardingScreen';

describe('OnboardingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders onboarding content', () => {
    render(
      <MemoryRouter>
        <OnboardingScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('Continue anonymous')).toBeTruthy();
  });

  it('calls createAnonymousUser and navigates to /onboarding/state on continue', () => {
    render(
      <MemoryRouter>
        <OnboardingScreen />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Continue anonymous'));

    expect(mockCreateAnonymousUser).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding/state');
  });
});
