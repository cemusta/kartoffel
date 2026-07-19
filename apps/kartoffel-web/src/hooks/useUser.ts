import { useState, useCallback, useMemo } from 'react';
import {
  generateUsername,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  recordQuizAnswers as storageRecordQuizAnswers,
  clearQuizProgress as storageClearQuizProgress,
  setShowGoogleSearch as storageSetShowGoogleSearch,
  setKeepTranslationsOn as storageSetKeepTranslationsOn,
  migrateUserToV2,
  type StoredUser,
  type QuestionTypeMap,
} from '@kartoffel/utils';
import { questions } from '@cemusta/burgertest';

const questionTypeMap: QuestionTypeMap = Object.fromEntries(
  questions.map(q => [q.id, q.type as 'general' | 'state']),
);

export function useUser() {
  const [user, setUser] = useState<StoredUser | null>(() => {
    migrateUserToV2(questionTypeMap);
    return getStoredUser();
  });

  const createAnonymousUser = useCallback(() => {
    const newUser: StoredUser = {
      version: 2,
      username: generateUsername(),
      createdAt: new Date().toISOString(),
      generalAnswers: {},
      stateAnswers: {},
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
    storageRecordQuizAnswers(correctIds, incorrectIds, questionTypeMap);
    const updated = getStoredUser();
    setUser(updated);
  }, []);

  const clearProgress = useCallback(() => {
    storageClearQuizProgress();
    const updated = getStoredUser();
    setUser(updated);
  }, []);

  const setShowGoogleSearch = useCallback((show: boolean) => {
    storageSetShowGoogleSearch(show);
    const updated = getStoredUser();
    setUser(updated);
  }, []);

  const setKeepTranslationsOn = useCallback((on: boolean) => {
    storageSetKeepTranslationsOn(on);
    const updated = getStoredUser();
    setUser(updated);
  }, []);

  const questionAnswers = useMemo<Record<number, boolean[]>>(() => {
    if (!user) return {};
    return { ...user.generalAnswers, ...user.stateAnswers };
  }, [user]);

  return {
    user,
    germanState: user?.germanState ?? null,
    questionAnswers,
    showGoogleSearch: user?.showGoogleSearch ?? true,
    keepTranslationsOn: user?.keepTranslationsOn ?? false,
    createAnonymousUser,
    clearUser,
    setGermanState,
    recordQuizAnswers,
    clearProgress,
    setShowGoogleSearch,
    setKeepTranslationsOn,
  };
}
