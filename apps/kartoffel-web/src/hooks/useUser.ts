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

  return { user, createAnonymousUser, clearUser };
}
