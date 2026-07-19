import { useRef, useEffect } from 'react';
import { ExamQuestionContainer } from '../ExamQuestionContainer';
import { TopBar } from '../TopBar';
import { QuestionData } from '../QuestionBody';
import styles from './RealExamQuizPage.module.css';

export interface RealExamQuizPageProps {
  onBack: () => void;
  questions: QuestionData[];
  passingScore?: number;
  onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
  onReviewWrong?: (wrongIds: number[], userAnswers: Record<number, string>) => void;
  onQuizStarted?: (started: boolean) => void;
}

export function RealExamQuizPage({
  onBack,
  questions,
  passingScore,
  onComplete,
  onReviewWrong,
  onQuizStarted,
}: RealExamQuizPageProps) {
  const examStartedRef = useRef(false);

  // Warn on browser refresh/close during an active exam
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examStartedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleBack = () => {
    if (examStartedRef.current) {
      const confirmed = window.confirm(
        'Are you sure you want to quit? Your exam progress will be lost.',
      );
      if (!confirmed) return;
    }
    onBack();
  };

  const handleExamStarted = (started: boolean) => {
    examStartedRef.current = started;
    onQuizStarted?.(started);
  };

  const handleComplete = (score: number, correctIds: number[], incorrectIds: number[]) => {
    examStartedRef.current = false;
    onQuizStarted?.(false);
    onComplete?.(score, correctIds, incorrectIds);
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
            <p className={styles.topBarTitle}>Real Exam</p>
          </>
        }
      />
      <div className={styles.content}>
        <ExamQuestionContainer
          questions={questions}
          passingScore={passingScore}
          onComplete={handleComplete}
          onReviewWrong={onReviewWrong}
          onExamStarted={handleExamStarted}
          randomizeOptions={false}
        />
      </div>
    </div>
  );
}
