import { useState, useCallback } from 'react';
import {
  generateUsername,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
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

  return {
    user,
    germanState: user?.germanState ?? null,
    createAnonymousUser,
    clearUser,
    setGermanState,
  };
}
