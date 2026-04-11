import { HTMLAttributes } from 'react';
import styles from './Answer.module.css';

export interface AnswerProps extends HTMLAttributes<HTMLButtonElement> {
  text?: string;
  imageUrl?: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onSelect?: () => void;
}

export function Answer({
  text,
  imageUrl,
  isSelected = false,
  isCorrect = false,
  isRevealed = false,
  onSelect,
  className = '',
  ...props
}: AnswerProps) {
  const classes = [
    styles.answer,
    isSelected && styles.selected,
    isRevealed && isCorrect && styles.correct,
    isRevealed && !isCorrect && isSelected && styles.incorrect,
    imageUrl && styles.hasImage,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onSelect} disabled={isRevealed} type="button" {...props}>
      {imageUrl && <img src={imageUrl} alt={text || 'Answer option'} className={styles.image} />}
      {text && <span className={styles.text}>{text}</span>}
    </button>
  );
}
