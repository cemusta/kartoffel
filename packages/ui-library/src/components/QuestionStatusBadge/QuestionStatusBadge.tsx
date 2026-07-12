import styles from './QuestionStatusBadge.module.css';

export type QuestionStatus = 'new' | 'correct' | 'wrong';

export interface QuestionStatusBadgeProps {
  status: QuestionStatus;
}

const BADGE_CONFIG: Record<QuestionStatus, { icon: string; label: string }> = {
  new: { icon: '✨', label: 'New' },
  correct: { icon: '✓', label: 'Correct' },
  wrong: { icon: '✗', label: 'Wrong' },
};

export function QuestionStatusBadge({ status }: QuestionStatusBadgeProps) {
  const config = BADGE_CONFIG[status];

  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.icon}>{config.icon}</span>
      <span className={styles.label}>{config.label}</span>
    </span>
  );
}
