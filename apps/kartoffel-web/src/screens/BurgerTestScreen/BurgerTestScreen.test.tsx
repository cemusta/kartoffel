import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@kartoffel/ui-library', () => ({
  BurgerTestPage: ({ onBack }: { onBack: () => void }) => <button onClick={onBack}>Back</button>,
}));

import { BurgerTestScreen } from './BurgerTestScreen';

describe('BurgerTestScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
