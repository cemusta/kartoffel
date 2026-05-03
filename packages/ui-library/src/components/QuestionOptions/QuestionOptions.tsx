import { HTMLAttributes } from 'react';
import styles from './QuestionOptions.module.css';

export interface QuestionOptionsProps extends HTMLAttributes<HTMLButtonElement> {
  label?: string;
  text?: string;
  textEn?: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  showTranslation?: boolean;
  onSelect?: () => void;
}

export function QuestionOptions({
  label,
  text,
  textEn,
  isSelected = false,
  isCorrect = false,
  isRevealed = false,
  showTranslation = false,
  onSelect,
  className = '',
  ...props
}: QuestionOptionsProps) {
  const classes = [
    styles.answer,
    isSelected && styles.selected,
    isRevealed && isCorrect && styles.correct,
    isRevealed && !isCorrect && isSelected && styles.incorrect,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showTranslated = showTranslation && Boolean(textEn);

  return (
    <button className={classes} onClick={onSelect} disabled={isRevealed} type="button" {...props}>
      {label && <span className={styles.label}>{label}</span>}
      <span className={styles.content}>
        {text && <span className={styles.text}>{text}</span>}
        {showTranslated && <span className={styles.translation}>{textEn}</span>}
      </span>
    </button>
  );
}
