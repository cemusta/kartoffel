import { HTMLAttributes } from 'react';
import styles from './Question.module.css';

export interface AnswerOption {
  text?: string;
  imageUrl?: string;
}

export interface QuestionData {
  id: number;
  text?: string;
  imageUrl?: string;
  options: (string | AnswerOption)[];
  correctAnswer: string | AnswerOption;
}

export interface QuestionProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  imageUrl?: string;
}

export function Question({ text, imageUrl, className = '', ...props }: QuestionProps) {
  return (
    <div className={`${styles.question} ${className}`} {...props}>
      {imageUrl && <img src={imageUrl} alt="Question" className={styles.image} />}
      {text && <h3 className={styles.text}>{text}</h3>}
    </div>
  );
}
