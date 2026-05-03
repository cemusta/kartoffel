import { USER_STORAGE_KEY } from './keys';

export interface StoredUser {
  username: string;
  createdAt: string;
  germanState?: string;
  correctQuestionIds?: number[];
  incorrectQuestionIds?: number[];
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
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
