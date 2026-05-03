import { HTMLAttributes } from 'react';
import styles from './ProgressGrid.module.css';

export interface ProgressGridProps extends HTMLAttributes<HTMLDivElement> {
  allQuestionIds: number[];
  correctIds: number[];
  incorrectIds: number[];
}

export function ProgressGrid({
  allQuestionIds,
  correctIds,
  incorrectIds,
  className = '',
  ...props
}: ProgressGridProps) {
  const correctSet = new Set(correctIds);
  const incorrectSet = new Set(incorrectIds);
  const masteredCount = correctIds.length;

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <p className={styles.summary}>
        <span className={styles.masteredCount}>{masteredCount}</span>
        <span className={styles.total}> / {allQuestionIds.length}</span>
        <span className={styles.label}> questions mastered</span>
      </p>
      <div className={styles.grid}>
        {allQuestionIds.map(id => {
          const isCorrect = correctSet.has(id);
          const isIncorrect = !isCorrect && incorrectSet.has(id);
          return (
            <span
              key={id}
              className={`${styles.cube} ${isCorrect ? styles.correct : isIncorrect ? styles.incorrect : styles.untouched}`}
              aria-label={isCorrect ? 'Correct' : isIncorrect ? 'Incorrect' : 'Not yet attempted'}
            />
          );
        })}
      </div>
    </div>
  );
}
