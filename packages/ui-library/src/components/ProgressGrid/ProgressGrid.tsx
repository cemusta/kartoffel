import { HTMLAttributes } from 'react';
import styles from './ProgressGrid.module.css';

export type AnswerHistory = boolean[];

export interface ProgressGridProps extends HTMLAttributes<HTMLDivElement> {
  allQuestionIds: number[];
  questionAnswers: Record<number, AnswerHistory>;
  stateQuestionIds?: number[];
}

type ConfidenceColor = 'mastered' | 'correct' | 'mixed' | 'incorrect' | 'struggling' | 'untouched';

export function getConfidenceColor(answers: AnswerHistory): ConfidenceColor {
  if (answers.length === 0) return 'untouched';
  const last2 = answers.slice(-2);
  if (last2.length === 1) return last2[0] ? 'correct' : 'incorrect';
  const [prev, last] = last2;
  if (prev && last) return 'mastered';
  if (!prev && !last) return 'struggling';
  return 'mixed';
}

export function ProgressGrid({
  allQuestionIds,
  questionAnswers,
  stateQuestionIds,
  className = '',
  ...props
}: ProgressGridProps) {
  const stateSet = new Set(stateQuestionIds ?? []);
  const generalIds = stateSet.size > 0 ? allQuestionIds.filter(id => !stateSet.has(id)) : allQuestionIds;
  const stateIds = stateQuestionIds ?? [];

  const solvedCount = allQuestionIds.filter(id => {
    const answers = questionAnswers[id] ?? [];
    return answers.length > 0 && answers.at(-1) === true;
  }).length;

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <p className={styles.summary}>
        <span className={styles.masteredCount}>{solvedCount}</span>
        <span className={styles.total}> / {allQuestionIds.length}</span>
        <span className={styles.label}> questions solved</span>
      </p>
      <div className={styles.gridsWrapper}>
        <div className={styles.grid}>
          {generalIds.map(id => (
            <span
              key={id}
              className={`${styles.cube} ${styles[getConfidenceColor(questionAnswers[id] ?? [])]}`}
              aria-label={getConfidenceColor(questionAnswers[id] ?? [])}
            />
          ))}
        </div>
        {stateIds.length > 0 && (
          <>
            <span className={styles.divider} aria-hidden="true" />
            <div className={styles.grid}>
              {stateIds.map(id => (
                <span
                  key={id}
                  className={`${styles.cube} ${styles[getConfidenceColor(questionAnswers[id] ?? [])]}`}
                  aria-label={getConfidenceColor(questionAnswers[id] ?? [])}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
