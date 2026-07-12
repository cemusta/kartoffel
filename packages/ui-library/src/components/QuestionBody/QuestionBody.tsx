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
  showGoogleSearch?: boolean;
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
  showGoogleSearch = true,
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
      const stateDisplayId = ((questionId - 1) % 10) + 1;
      questionLabel = `${stateName} ${stateDisplayId}`;
    } else if (questionType === 'general') {
      questionLabel = `General ${questionId}`;
    } else {
      questionLabel = `${questionId}`;
    }
  }

  const handleGoogleSearch = () => {
    const searchQuery = encodeURIComponent(text || '');
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`${styles.question} ${className}`} {...props}>
      {text && showGoogleSearch && (
        <button
          className={styles.googleButton}
          onClick={handleGoogleSearch}
          title="Search on Google"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="16"
            height="16"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      )}
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
