import { USER_STORAGE_KEY } from './keys';

export interface StoredUser {
  username: string;
  createdAt: string;
  germanState?: string;
  correctQuestionIds?: number[];
  incorrectQuestionIds?: number[];
  showGoogleSearch?: boolean;
  keepTranslationsOn?: boolean;
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as StoredUser;
    // Default showGoogleSearch to true if missing
    if (user.showGoogleSearch === undefined) {
      user.showGoogleSearch = true;
    }
    // Default keepTranslationsOn to false if missing
    if (user.keepTranslationsOn === undefined) {
      user.keepTranslationsOn = false;
    }
    return user;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function recordQuizAnswers(correctIds: number[], incorrectIds: number[]): void {
  const current = getStoredUser();
  if (!current) return;

  const newCorrectSet = new Set([...(current.correctQuestionIds ?? []), ...correctIds]);
  // Remove from incorrect anything that is now correct
  const newIncorrectSet = new Set(
    [...(current.incorrectQuestionIds ?? []), ...incorrectIds].filter(id => !newCorrectSet.has(id)),
  );

  setStoredUser({
    ...current,
    correctQuestionIds: Array.from(newCorrectSet),
    incorrectQuestionIds: Array.from(newIncorrectSet),
  });
}

export function clearQuizProgress(): void {
  const current = getStoredUser();
  if (!current) return;
  setStoredUser({ ...current, correctQuestionIds: [], incorrectQuestionIds: [] });
}

export function setShowGoogleSearch(show: boolean): void {
  const current = getStoredUser();
  if (!current) return;
  setStoredUser({ ...current, showGoogleSearch: show });
}

export function setKeepTranslationsOn(on: boolean): void {
  const current = getStoredUser();
  if (!current) return;
  setStoredUser({ ...current, keepTranslationsOn: on });
}
