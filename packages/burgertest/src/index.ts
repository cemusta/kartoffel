export type { Question, QuestionType, OptionKey } from './types.js';

import questionsData from '../data/questions.json' with { type: 'json' };
import type { Question } from './types.js';

/** All 460 German citizenship test questions. */
export const questions: Question[] = questionsData as Question[];
