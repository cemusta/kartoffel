import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StoredUser } from '@kartoffel/utils';

vi.mock('@kartoffel/utils', () => ({
  generateUsername: vi.fn(() => 'test-user'),
  getStoredUser: vi.fn(() => null),
  setStoredUser: vi.fn(),
  clearStoredUser: vi.fn(),
}));

import { generateUsername, getStoredUser, setStoredUser, clearStoredUser } from '@kartoffel/utils';
import { useUser } from './useUser';

const storedUser: StoredUser = { username: 'stored-user', createdAt: '2024-01-01T00:00:00.000Z' };

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
    expect(setStoredUser).toHaveBeenCalledWith(expect.objectContaining({ username: 'test-user' }));
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
});
