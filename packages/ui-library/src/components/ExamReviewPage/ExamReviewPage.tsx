import { useRef, useEffect, useCallback } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer } from '../QuestionContainer';
import { TopBar } from '../TopBar';
import styles from './ExamReviewPage.module.css';

export interface ExamReviewPageProps {
  questions: QuestionData[];
  userAnswers: Record<number, string>;
  onBack: () => void;
}

export function ExamReviewPage({ questions, userAnswers, onBack }: ExamReviewPageProps) {
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    questionRefs.current = questionRefs.current.slice(0, questions.length);
  }, [questions.length]);

  const scrollToQuestion = useCallback((index: number) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndexRef.current = Math.max(0, currentIndexRef.current - 1);
        scrollToQuestion(currentIndexRef.current);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndexRef.current = Math.min(questions.length - 1, currentIndexRef.current + 1);
        scrollToQuestion(currentIndexRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions.length, scrollToQuestion]);

  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <>
            <button
              className={styles.backButton}
              onClick={onBack}
              aria-label="Go back"
              type="button"
            >
              ‹
            </button>
            <p className={styles.topBarTitle}>
              Wrong Answers
              <span className={styles.count}> · {questions.length}</span>
            </p>
          </>
        }
      />
      <div className={styles.content}>
        <p className={styles.hint}>
          Your selection is shown in red · correct answer in green
        </p>
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={styles.item}
            ref={el => {
              questionRefs.current[index] = el;
            }}
          >
            <QuestionContainer
              question={question}
              selectedAnswer={userAnswers[question.id] ?? null}
              isRevealed={true}
              showTranslation={false}
              onSelect={() => {}}
              randomizeOptions={false}
              showGoogleSearch={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
