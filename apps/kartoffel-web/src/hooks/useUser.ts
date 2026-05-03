import { useState, useCallback } from 'react';
import {
  generateUsername,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  recordQuizAnswers as storageRecordQuizAnswers,
  clearQuizProgress as storageClearQuizProgress,
  type StoredUser,
} from '@kartoffel/utils';

export function useUser() {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());

  const createAnonymousUser = useCallback(() => {
    const newUser: StoredUser = {
      username: generateUsername(),
      createdAt: new Date().toISOString(),
    };
    setStoredUser(newUser);
    setUser(newUser);
    return newUser;
  }, []);

  const clearUser = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  const setGermanState = useCallback(
    (state: string) => {
      const current = getStoredUser();
      if (!current) return;
      const updated: StoredUser = { ...current, germanState: state };
      setStoredUser(updated);
      setUser(updated);
    },
    [],
  );

  const recordQuizAnswers = useCallback((correctIds: number[], incorrectIds: number[]) => {
    storageRecordQuizAnswers(correctIds, incorrectIds);
    const updated = getStoredUser();
    setUser(updated);
  }, []);

  const clearProgress = useCallback(() => {
    storageClearQuizProgress();
    const updated = getStoredUser();
    setUser(updated);
  }, []);

  return {
    user,
    germanState: user?.germanState ?? null,
    correctQuestionIds: user?.correctQuestionIds ?? [],
    incorrectQuestionIds: user?.incorrectQuestionIds ?? [],
    createAnonymousUser,
    clearUser,
    setGermanState,
    recordQuizAnswers,
    clearProgress,
  };
}
