import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredUser, setStoredUser, clearStoredUser, recordQuizAnswers, clearQuizProgress } from './userStorage';
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
      expect(getStoredUser()).toEqual({ ...user, showGoogleSearch: true });
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
      expect(getStoredUser()).toEqual({ ...second, showGoogleSearch: true });
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

  describe('recordQuizAnswers', () => {
    const baseUser = { username: 'TestUser42', createdAt: '2026-01-01T00:00:00.000Z' };

    it('does nothing when no user stored', () => {
      expect(() => recordQuizAnswers([1, 2], [3])).not.toThrow();
      expect(getStoredUser()).toBeNull();
    });

    it('records correct and incorrect ids', () => {
      setStoredUser(baseUser);
      recordQuizAnswers([1, 2], [3, 4]);
      const stored = getStoredUser();
      expect(stored?.correctQuestionIds).toEqual(expect.arrayContaining([1, 2]));
      expect(stored?.incorrectQuestionIds).toEqual(expect.arrayContaining([3, 4]));
    });

    it('deduplicates ids on repeated calls', () => {
      setStoredUser(baseUser);
      recordQuizAnswers([1, 2], [3]);
      recordQuizAnswers([2, 5], [3]);
      const stored = getStoredUser();
      expect(stored?.correctQuestionIds?.filter(id => id === 2)).toHaveLength(1);
      expect(stored?.incorrectQuestionIds?.filter(id => id === 3)).toHaveLength(1);
    });

    it('promotes id from incorrect to correct when answered correctly later', () => {
      setStoredUser(baseUser);
      recordQuizAnswers([], [5]);
      let stored = getStoredUser();
      expect(stored?.incorrectQuestionIds).toContain(5);
      expect(stored?.correctQuestionIds ?? []).not.toContain(5);

      recordQuizAnswers([5], []);
      stored = getStoredUser();
      expect(stored?.correctQuestionIds).toContain(5);
      expect(stored?.incorrectQuestionIds ?? []).not.toContain(5);
    });

    it('correct always wins when id appears in both new batches', () => {
      setStoredUser(baseUser);
      recordQuizAnswers([7], [7]);
      const stored = getStoredUser();
      expect(stored?.correctQuestionIds).toContain(7);
      expect(stored?.incorrectQuestionIds ?? []).not.toContain(7);
    });
  });

  describe('clearQuizProgress', () => {
    it('does nothing when no user stored', () => {
      expect(() => clearQuizProgress()).not.toThrow();
    });

    it('resets correctQuestionIds and incorrectQuestionIds to empty arrays', () => {
      setStoredUser({
        username: 'TestUser42',
        createdAt: '2026-01-01T00:00:00.000Z',
        correctQuestionIds: [1, 2, 3],
        incorrectQuestionIds: [4, 5],
      });
      clearQuizProgress();
      const stored = getStoredUser();
      expect(stored?.correctQuestionIds).toEqual([]);
      expect(stored?.incorrectQuestionIds).toEqual([]);
    });

    it('preserves other user fields when clearing progress', () => {
      setStoredUser({
        username: 'TestUser42',
        createdAt: '2026-01-01T00:00:00.000Z',
        germanState: 'Bayern',
        correctQuestionIds: [1],
        incorrectQuestionIds: [2],
      });
      clearQuizProgress();
      const stored = getStoredUser();
      expect(stored?.username).toBe('TestUser42');
      expect(stored?.germanState).toBe('Bayern');
    });
  });
});
