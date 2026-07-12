import { useRef, useEffect } from 'react';
import { QuizQuestionContainer } from '../QuizQuestionContainer';
import { TopBar } from '../TopBar';
import { QuestionData } from '../QuestionBody';
import styles from './PracticeQuizPage.module.css';

export interface PracticeQuizPageProps {
  onBack: () => void;
  questions: QuestionData[];
  passingScore?: number;
  onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
  title?: string;
  onQuizStarted?: (started: boolean) => void;
  randomizeOptions?: boolean;
}

export function PracticeQuizPage({
  onBack,
  questions,
  passingScore,
  onComplete,
  title = 'Practice Quiz',
  onQuizStarted,
  randomizeOptions = false,
}: PracticeQuizPageProps) {
  const quizStartedRef = useRef(false);

  // Prevent page refresh/close when quiz is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStartedRef.current) {
        e.preventDefault();
        // Modern browsers ignore custom messages, but setting returnValue is required
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleBack = () => {
    if (quizStartedRef.current) {
      const confirmed = window.confirm(
        'Are you sure you want to quit? Your progress will be lost.'
      );
      if (!confirmed) {
        return;
      }
    }
    onBack();
  };

  const handleComplete = (score: number, correctIds: number[], incorrectIds: number[]) => {
    quizStartedRef.current = false;
    onQuizStarted?.(false);
    onComplete?.(score, correctIds, incorrectIds);
  };

  const handleQuizStart = () => {
    if (!quizStartedRef.current) {
      quizStartedRef.current = true;
      onQuizStarted?.(true);
    }
  };

  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <>
            <button
              className={styles.backButton}
              onClick={handleBack}
              aria-label="Go back"
              type="button"
            >
              ‹
            </button>
            <p className={styles.topBarTitle}>{title}</p>
          </>
        }
      />
      <div className={styles.content}>
        <QuizQuestionContainer
          questions={questions}
          passingScore={passingScore}
          onComplete={handleComplete}
          onClick={handleQuizStart}
          randomizeOptions={randomizeOptions}
        />
      </div>
    </div>
  );
}
