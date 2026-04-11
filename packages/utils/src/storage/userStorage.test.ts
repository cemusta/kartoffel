import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredUser, setStoredUser, clearStoredUser } from './userStorage';
import { USER_STORAGE_KEY } from './keys';

describe('userStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStoredUser', () => {
    it('returns null when nothing stored', () => {
      expect(getStoredUser()).toBeNull();
    });

    it('returns null on invalid JSON', () => {
      localStorage.setItem(USER_STORAGE_KEY, 'not-json');
      expect(getStoredUser()).toBeNull();
    });

    it('returns parsed user when stored', () => {
      const user = { username: 'TestUser42', createdAt: '2026-01-01T00:00:00.000Z' };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      expect(getStoredUser()).toEqual(user);
    });
  });

  describe('setStoredUser', () => {
    it('stores user in localStorage', () => {
      const user = { username: 'BoldOtter55', createdAt: '2026-04-11T00:00:00.000Z' };
      setStoredUser(user);
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      expect(JSON.parse(raw!)).toEqual(user);
    });

    it('overwrites existing user', () => {
      const first = { username: 'OldUser10', createdAt: '2026-01-01T00:00:00.000Z' };
      const second = { username: 'NewUser99', createdAt: '2026-04-11T00:00:00.000Z' };
      setStoredUser(first);
      setStoredUser(second);
      expect(getStoredUser()).toEqual(second);
    });
  });

  describe('clearStoredUser', () => {
    it('removes user from localStorage', () => {
      setStoredUser({ username: 'BoldOtter55', createdAt: '2026-04-11T00:00:00.000Z' });
      clearStoredUser();
      expect(getStoredUser()).toBeNull();
    });

    it('does not throw when nothing stored', () => {
      expect(() => clearStoredUser()).not.toThrow();
    });
  });
});
