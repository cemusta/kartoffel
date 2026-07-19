import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StoredUser } from '@kartoffel/utils';

vi.mock('@kartoffel/utils', () => ({
  generateUsername: vi.fn(() => 'test-user'),
  getStoredUser: vi.fn(() => null),
  setStoredUser: vi.fn(),
  clearStoredUser: vi.fn(),
  recordQuizAnswers: vi.fn(),
  clearQuizProgress: vi.fn(),
  migrateUserToV2: vi.fn(),
}));

vi.mock('@cemusta/burgertest', () => ({
  questions: [],
}));

import { generateUsername, getStoredUser, setStoredUser, clearStoredUser, recordQuizAnswers, clearQuizProgress } from '@kartoffel/utils';
import { useUser } from './useUser';

const storedUser: StoredUser = {
  version: 2,
  username: 'stored-user',
  createdAt: '2024-01-01T00:00:00.000Z',
  generalAnswers: {},
  stateAnswers: {},
};

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStoredUser).mockReturnValue(null);
  });

  it('initializes with null when no stored user', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current.user).toBeNull();
  });

  it('initializes with stored user when one exists', () => {
    vi.mocked(getStoredUser).mockReturnValue(storedUser);
    const { result } = renderHook(() => useUser());
    expect(result.current.user).toEqual(storedUser);
  });

  it('createAnonymousUser generates username, stores and returns user', () => {
    const { result } = renderHook(() => useUser());

    let returned: StoredUser | undefined;
    act(() => {
      returned = result.current.createAnonymousUser();
    });

    expect(generateUsername).toHaveBeenCalled();
    expect(setStoredUser).toHaveBeenCalledWith(expect.objectContaining({ username: 'test-user', version: 2 }));
    expect(result.current.user).toEqual(returned);
    expect(result.current.user?.username).toBe('test-user');
  });

  it('createAnonymousUser sets createdAt to current time', () => {
    const before = Date.now();
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.createAnonymousUser();
    });

    const after = Date.now();
    const createdAt = new Date(result.current.user!.createdAt).getTime();
    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
  });

  it('clearUser clears storage and sets user to null', () => {
    vi.mocked(getStoredUser).mockReturnValue(storedUser);
    const { result } = renderHook(() => useUser());

    expect(result.current.user).toEqual(storedUser);

    act(() => {
      result.current.clearUser();
    });

    expect(clearStoredUser).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('exposes empty questionAnswers when not stored', () => {
    const { result } = renderHook(() => useUser());
    expect(result.current.questionAnswers).toEqual({});
  });

  it('exposes merged questionAnswers from generalAnswers and stateAnswers', () => {
    const userWithAnswers: StoredUser = {
      ...storedUser,
      generalAnswers: { 1: [true, true], 2: [false] },
      stateAnswers: { 301: [true] },
    };
    vi.mocked(getStoredUser).mockReturnValue(userWithAnswers);
    const { result } = renderHook(() => useUser());
    expect(result.current.questionAnswers).toEqual({ 1: [true, true], 2: [false], 301: [true] });
  });

  it('recordQuizAnswers calls storage function and re-reads user', () => {
    const updatedUser: StoredUser = {
      ...storedUser,
      generalAnswers: { 1: [true] },
    };
    vi.mocked(getStoredUser).mockReturnValueOnce(storedUser).mockReturnValue(updatedUser);

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.recordQuizAnswers([1], []);
    });

    expect(recordQuizAnswers).toHaveBeenCalledWith([1], [], expect.any(Object));
    expect(result.current.questionAnswers[1]).toEqual([true]);
  });

  it('clearProgress calls storage clearQuizProgress and re-reads user', () => {
    const clearedUser: StoredUser = { ...storedUser, generalAnswers: {}, stateAnswers: {} };
    vi.mocked(getStoredUser).mockReturnValueOnce(storedUser).mockReturnValue(clearedUser);

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.clearProgress();
    });

    expect(clearQuizProgress).toHaveBeenCalled();
    expect(result.current.questionAnswers).toEqual({});
  });
});
