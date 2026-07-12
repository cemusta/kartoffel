import { HTMLAttributes } from 'react';
import styles from './QuestionBody.module.css';

export interface QuestionData {
  id: number;
  type?: 'general' | 'state';
  state?: string;
  text: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer?: 'a' | 'b' | 'c' | 'd';
  image?: string | string[];
  imageText?: string;
  translations?: {
    [lang: string]: {
      text: string;
      options: { a: string; b: string; c: string; d: string };
      context?: string;
    };
  };
}

export interface QuestionBodyProps extends HTMLAttributes<HTMLDivElement> {
  text?: string;
  textEn?: string;
  imageUrl?: string | string[];
  imageText?: string;
  showTranslation?: boolean;
  questionId?: number;
  questionType?: 'general' | 'state';
  stateName?: string;
}

function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http') || url.startsWith('/')) return url;
  if (url.startsWith('./')) return url.slice(1);
  return `/${url}`;
}

export function QuestionBody({
  text,
  textEn,
  imageUrl,
  imageText,
  showTranslation = false,
  questionId,
  questionType,
  stateName,
  className = '',
  ...props
}: QuestionBodyProps) {
  const showTranslated = showTranslation && Boolean(textEn);
  const images = (Array.isArray(imageUrl) ? imageUrl : imageUrl ? [imageUrl] : []).map(
    toAbsoluteUrl
  );

  const showQuestionLabel = questionId !== undefined;
  let questionLabel = '';
  if (showQuestionLabel) {
    if (questionType === 'state' && stateName) {
      questionLabel = `${stateName} ${questionId}`;
    } else if (questionType === 'general') {
      questionLabel = `General ${questionId}`;
    } else {
      questionLabel = `${questionId}`;
    }
  }

  return (
    <div className={`${styles.question} ${className}`} {...props}>
      {showQuestionLabel && <p className={styles.questionLabel}>{questionLabel}</p>}
      {images.length === 1 && (
        <>
          <img src={images[0]} alt="Question" className={styles.image} />
          {imageText && <p className={styles.imageCaption}>{imageText}</p>}
        </>
      )}
      {images.length > 1 && (
        <div className={styles.imageRow}>
          {images.map((src, i) => (
            <div key={src} className={styles.imageRowItem}>
              <img src={src} alt={`Option ${i + 1}`} className={styles.rowImage} />
              <span className={styles.imageLabel}>{String.fromCharCode(65 + i)}</span>
            </div>
          ))}
        </div>
      )}
      {text && <h3 className={styles.text}>{text}</h3>}
      {showTranslated && <p className={styles.translation}>{textEn}</p>}
    </div>
  );
}
