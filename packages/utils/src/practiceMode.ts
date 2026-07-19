/** Minimal shape required for question selection. */
export interface PracticeQuestion {
  id: number;
}

/**
 * Selects the question with the weakest performance from the candidate pool.
 *
 * Priority (lowest = best candidate to show next):
 *   0 — never answered
 *   1 — last attempt was wrong
 *   2 — last attempt was correct
 *
 * Questions within the same priority tier are shuffled randomly to avoid
 * always picking the same question.
 *
 * `excludeId` prevents the immediately previous question from repeating.
 * Falls back to the full list when filtering would leave an empty pool.
 */
export function pickWorstQuestion<T extends PracticeQuestion>(
  questions: T[],
  questionAnswers: Record<number, boolean[]>,
  excludeId?: number,
): T {
  const pool =
    excludeId !== undefined
      ? questions.filter(q => q.id !== excludeId)
      : [...questions];

  // Fallback: if excluding left nothing (e.g. only 1 question), use all
  const candidates = pool.length > 0 ? pool : [...questions];

  const scored = candidates.map(q => {
    const history = questionAnswers[q.id];
    let priority: number;
    if (!history || history.length === 0) {
      priority = 0;
    } else if (history[history.length - 1] === false) {
      priority = 1;
    } else {
      priority = 2;
    }
    return { q, priority, rand: Math.random() };
  });

  scored.sort((a, b) => a.priority - b.priority || a.rand - b.rand);
  return scored[0].q;
}
