import { USER_STORAGE_KEY } from './keys';

export type QuestionType = 'general' | 'state';
export type QuestionTypeMap = Record<number, QuestionType>;

export interface StoredUser {
  version: 2;
  username: string;
  createdAt: string;
  germanState?: string;
  generalAnswers: Record<number, boolean[]>;
  stateAnswers: Record<number, boolean[]>;
  showGoogleSearch?: boolean;
  keepTranslationsOn?: boolean;
  /** @deprecated v1 field — present only before migration */
  correctQuestionIds?: number[];
  /** @deprecated v1 field — present only before migration */
  incorrectQuestionIds?: number[];
}

const MAX_HISTORY = 5;

function appendAnswer(map: Record<number, boolean[]>, id: number, correct: boolean): void {
  const prev = map[id] ?? [];
  map[id] = [...prev, correct].slice(-MAX_HISTORY);
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = JSON.parse(raw) as any;
    if (user.showGoogleSearch === undefined) user.showGoogleSearch = true;
    if (user.keepTranslationsOn === undefined) user.keepTranslationsOn = false;
    // Ensure v2 fields exist even on a v1 record (migration fills them via migrateUserToV2)
    if (!user.generalAnswers) user.generalAnswers = {};
    if (!user.stateAnswers) user.stateAnswers = {};
    return user as StoredUser;
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

/**
 * Migrates a v1 user (correctQuestionIds / incorrectQuestionIds) to v2
 * (generalAnswers / stateAnswers). Safe to call multiple times — no-ops if
 * already v2. Must be called with a question-type map from the app layer.
 */
export function migrateUserToV2(questionTypeMap: QuestionTypeMap): void {
  const user = getStoredUser();
  if (!user) return;
  if (user.version === 2) return;

  const generalAnswers: Record<number, boolean[]> = {};
  const stateAnswers: Record<number, boolean[]> = {};

  for (const id of user.correctQuestionIds ?? []) {
    const type = questionTypeMap[id] ?? 'general';
    if (type === 'state') {
      stateAnswers[id] = [true];
    } else {
      generalAnswers[id] = [true];
    }
  }
  for (const id of user.incorrectQuestionIds ?? []) {
    const type = questionTypeMap[id] ?? 'general';
    if (type === 'state') {
      stateAnswers[id] = [false];
    } else {
      generalAnswers[id] = [false];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correctQuestionIds: _c, incorrectQuestionIds: _i, ...rest } = user;
  setStoredUser({ ...rest, version: 2, generalAnswers, stateAnswers });
}

export function recordQuizAnswers(
  correctIds: number[],
  incorrectIds: number[],
  questionTypeMap: QuestionTypeMap,
): void {
  const current = getStoredUser();
  if (!current) return;

  const generalAnswers = { ...current.generalAnswers };
  const stateAnswers = { ...current.stateAnswers };

  for (const id of correctIds) {
    const type = questionTypeMap[id] ?? 'general';
    if (type === 'state') {
      appendAnswer(stateAnswers, id, true);
    } else {
      appendAnswer(generalAnswers, id, true);
    }
  }
  for (const id of incorrectIds) {
    const type = questionTypeMap[id] ?? 'general';
    if (type === 'state') {
      appendAnswer(stateAnswers, id, false);
    } else {
      appendAnswer(generalAnswers, id, false);
    }
  }

  setStoredUser({ ...current, version: 2, generalAnswers, stateAnswers });
}

export function clearQuizProgress(): void {
  const current = getStoredUser();
  if (!current) return;
  setStoredUser({ ...current, version: 2, generalAnswers: {}, stateAnswers: {} });
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
