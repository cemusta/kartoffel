import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredUser, setStoredUser, clearStoredUser, recordQuizAnswers, clearQuizProgress, migrateUserToV2 } from './userStorage';
import type { StoredUser, QuestionTypeMap } from './userStorage';
import { USER_STORAGE_KEY } from './keys';

const BASE_USER: StoredUser = {
  version: 2,
  username: 'TestUser42',
  createdAt: '2026-01-01T00:00:00.000Z',
  generalAnswers: {},
  stateAnswers: {},
};

const TYPE_MAP: QuestionTypeMap = { 1: 'general', 2: 'general', 3: 'state', 4: 'state', 5: 'general', 6: 'state', 7: 'general' };

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

    it('returns parsed v2 user when stored', () => {
      setStoredUser(BASE_USER);
      expect(getStoredUser()).toEqual({ ...BASE_USER, showGoogleSearch: true, keepTranslationsOn: false });
    });

    it('defaults showGoogleSearch to true if missing', () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...BASE_USER }));
      expect(getStoredUser()?.showGoogleSearch).toBe(true);
    });

    it('defaults keepTranslationsOn to false if missing', () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...BASE_USER }));
      expect(getStoredUser()?.keepTranslationsOn).toBe(false);
    });

    it('provides empty answer maps for v1 records without them', () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        username: 'OldUser', createdAt: '2026-01-01T00:00:00.000Z',
        correctQuestionIds: [1], incorrectQuestionIds: [2],
      }));
      const user = getStoredUser();
      expect(user?.generalAnswers).toEqual({});
      expect(user?.stateAnswers).toEqual({});
    });
  });

  describe('setStoredUser', () => {
    it('stores user in localStorage', () => {
      setStoredUser(BASE_USER);
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      expect(JSON.parse(raw!)).toEqual(BASE_USER);
    });

    it('overwrites existing user', () => {
      const second: StoredUser = { ...BASE_USER, username: 'NewUser99' };
      setStoredUser(BASE_USER);
      setStoredUser(second);
      expect(getStoredUser()?.username).toBe('NewUser99');
    });
  });

  describe('clearStoredUser', () => {
    it('removes user from localStorage', () => {
      setStoredUser(BASE_USER);
      clearStoredUser();
      expect(getStoredUser()).toBeNull();
    });

    it('does not throw when nothing stored', () => {
      expect(() => clearStoredUser()).not.toThrow();
    });
  });

  describe('migrateUserToV2', () => {
    it('does nothing when no user stored', () => {
      expect(() => migrateUserToV2(TYPE_MAP)).not.toThrow();
    });

    it('does nothing when user is already v2', () => {
      const user: StoredUser = { ...BASE_USER, generalAnswers: { 1: [true] }, stateAnswers: {} };
      setStoredUser(user);
      migrateUserToV2(TYPE_MAP);
      expect(getStoredUser()?.generalAnswers).toEqual({ 1: [true] });
    });

    it('converts v1 correctQuestionIds to generalAnswers/stateAnswers', () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        username: 'TestUser42', createdAt: '2026-01-01T00:00:00.000Z',
        correctQuestionIds: [1, 3], incorrectQuestionIds: [2, 4],
      }));
      migrateUserToV2(TYPE_MAP);
      const user = getStoredUser();
      expect(user?.version).toBe(2);
      expect(user?.generalAnswers).toEqual({ 1: [true], 2: [false] });
      expect(user?.stateAnswers).toEqual({ 3: [true], 4: [false] });
    });

    it('removes v1 fields after migration', () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        username: 'TestUser42', createdAt: '2026-01-01T00:00:00.000Z',
        correctQuestionIds: [1], incorrectQuestionIds: [2],
      }));
      migrateUserToV2(TYPE_MAP);
      const raw = JSON.parse(localStorage.getItem(USER_STORAGE_KEY)!);
      expect(raw.correctQuestionIds).toBeUndefined();
      expect(raw.incorrectQuestionIds).toBeUndefined();
    });

    it('preserves other user fields during migration', () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        username: 'FancyWolf', createdAt: '2026-01-01T00:00:00.000Z',
        germanState: 'Bayern', correctQuestionIds: [], incorrectQuestionIds: [],
        showGoogleSearch: false, keepTranslationsOn: true,
      }));
      migrateUserToV2(TYPE_MAP);
      const user = getStoredUser();
      expect(user?.username).toBe('FancyWolf');
      expect(user?.germanState).toBe('Bayern');
      expect(user?.showGoogleSearch).toBe(false);
      expect(user?.keepTranslationsOn).toBe(true);
    });
  });

  describe('recordQuizAnswers', () => {
    it('does nothing when no user stored', () => {
      expect(() => recordQuizAnswers([1], [2], TYPE_MAP)).not.toThrow();
    });

    it('records correct answers in the right bucket', () => {
      setStoredUser(BASE_USER);
      recordQuizAnswers([1, 3], [], TYPE_MAP);
      const user = getStoredUser();
      expect(user?.generalAnswers[1]).toEqual([true]);
      expect(user?.stateAnswers[3]).toEqual([true]);
    });

    it('records incorrect answers in the right bucket', () => {
      setStoredUser(BASE_USER);
      recordQuizAnswers([], [2, 4], TYPE_MAP);
      const user = getStoredUser();
      expect(user?.generalAnswers[2]).toEqual([false]);
      expect(user?.stateAnswers[4]).toEqual([false]);
    });

    it('appends to existing history', () => {
      setStoredUser({ ...BASE_USER, generalAnswers: { 1: [false] } });
      recordQuizAnswers([1], [], TYPE_MAP);
      expect(getStoredUser()?.generalAnswers[1]).toEqual([false, true]);
    });

    it('caps history at 5 entries', () => {
      setStoredUser({ ...BASE_USER, generalAnswers: { 1: [true, true, true, true, true] } });
      recordQuizAnswers([], [1], TYPE_MAP);
      const history = getStoredUser()?.generalAnswers[1];
      expect(history).toHaveLength(5);
      expect(history?.at(-1)).toBe(false);
    });

    it('accumulates multiple quiz sessions', () => {
      setStoredUser(BASE_USER);
      recordQuizAnswers([1], [], TYPE_MAP);
      recordQuizAnswers([], [1], TYPE_MAP);
      recordQuizAnswers([1], [], TYPE_MAP);
      expect(getStoredUser()?.generalAnswers[1]).toEqual([true, false, true]);
    });
  });

  describe('clearQuizProgress', () => {
    it('does nothing when no user stored', () => {
      expect(() => clearQuizProgress()).not.toThrow();
    });

    it('resets generalAnswers and stateAnswers to empty objects', () => {
      setStoredUser({ ...BASE_USER, generalAnswers: { 1: [true] }, stateAnswers: { 3: [false] } });
      clearQuizProgress();
      const user = getStoredUser();
      expect(user?.generalAnswers).toEqual({});
      expect(user?.stateAnswers).toEqual({});
    });

    it('preserves other fields when clearing progress', () => {
      setStoredUser({ ...BASE_USER, germanState: 'Bayern', generalAnswers: { 1: [true] } });
      clearQuizProgress();
      const user = getStoredUser();
      expect(user?.username).toBe('TestUser42');
      expect(user?.germanState).toBe('Bayern');
    });
  });
});
