import { HTMLAttributes, useState, useCallback, useMemo, useEffect } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer } from '../QuestionContainer';
import styles from './ExamQuestionContainer.module.css';

const EXAM_DURATION_SECONDS = 60 * 60; // 60 minutes

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export interface ExamQuestionContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  passingScore?: number;
  onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
  onReviewWrong?: (wrongIds: number[], userAnswers: Record<number, string>) => void;
  randomizeOptions?: boolean;
  onExamStarted?: (started: boolean) => void;
}

export function ExamQuestionContainer({
  questions,
  passingScore,
  onComplete,
  onReviewWrong,
  randomizeOptions = false,
  onExamStarted,
  className = '',
  ...props
}: ExamQuestionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correctIds: number[];
    incorrectIds: number[];
    userAnswers: Record<number, string>;
  } | null>(null);


  // 60-minute count-up timer
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const isOverTime = elapsed >= EXAM_DURATION_SECONDS;

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers.get(currentIndex) ?? null;
  const answeredCount = answers.size;
  const allAnswered = answeredCount === questions.length;

  const handleSelect = useCallback(
    (key: string) => {
      setAnswers(prev => {
        const next = new Map(prev).set(currentIndex, key);
        if (prev.size === 0) {
          onExamStarted?.(true);
        }
        return next;
      });
    },
    [currentIndex, onExamStarted],
  );

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
  }, [questions.length]);

  const handleFinish = useCallback(() => {
    const correctIds: number[] = [];
    const incorrectIds: number[] = [];
    const userAnswers: Record<number, string> = {};

    questions.forEach((q, idx) => {
      const userAnswer = answers.get(idx);
      if (userAnswer !== undefined) {
        userAnswers[q.id] = userAnswer;
      }
      if (userAnswer === q.correctAnswer) {
        correctIds.push(q.id);
      } else {
        incorrectIds.push(q.id);
      }
    });

    const score = correctIds.length;
    setResults({ score, correctIds, incorrectIds, userAnswers });
    setFinished(true);
    onExamStarted?.(false);
    onComplete?.(score, correctIds, incorrectIds);
  }, [questions, answers, onComplete, onExamStarted]);

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers(new Map());
    setFinished(false);
    setResults(null);
    setElapsed(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (finished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if (key === 'arrowleft') {
        e.preventDefault();
        handlePrevious();
        return;
      }
      if (key === 'arrowright') {
        e.preventDefault();
        handleNext();
        return;
      }

      if (!finished) {
        const numKey = parseInt(key, 10);
        if (numKey >= 1 && numKey <= 4) {
          e.preventDefault();
          const answerKey = ['a', 'b', 'c', 'd'][numKey - 1];
          handleSelect(answerKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, handlePrevious, handleNext, handleSelect]);

  // Answered pills for navigation overview
  const answeredIndexes = useMemo(() => new Set(answers.keys()), [answers]);

  if (finished && results) {
    const { score, incorrectIds, userAnswers } = results;
    const passed = passingScore !== undefined ? score >= passingScore : undefined;

    return (
      <div className={`${styles.container} ${className}`} {...props}>
        <div className={styles.results}>
          <h2 className={styles.resultsTitle}>Exam Complete!</h2>
          <p className={styles.score}>
            Score: {score} / {questions.length}
          </p>
          <p className={styles.percentage}>{Math.round((score / questions.length) * 100)}%</p>
          {passed !== undefined && (
            <p className={passed ? styles.passed : styles.failed}>
              {passed ? '✓ Passed' : '✗ Failed'}
              {passingScore !== undefined && (
                <span className={styles.passingHint}> · {passingScore} needed to pass</span>
              )}
            </p>
          )}
          <div className={styles.resultActions}>
            <button className={styles.button} onClick={handleReset} type="button">
              Try Again
            </button>
            {incorrectIds.length > 0 && onReviewWrong && (
              <button
                className={`${styles.button} ${styles.reviewButton}`}
                onClick={() => onReviewWrong(incorrectIds, userAnswers)}
                type="button"
              >
                Review Wrong Answers ({incorrectIds.length})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <div className={styles.header}>
        <span className={styles.progress}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className={styles.headerRight}>
          <span className={styles.answeredCount}>
            {answeredCount} / {questions.length} answered
          </span>
          <span className={isOverTime ? styles.timerOver : styles.timer}>
            {formatTime(elapsed)}
            {isOverTime && ' ⚠'}
          </span>
        </div>
      </div>

      <div className={styles.navPills}>
        {questions.map((_, idx) => (
          <button
            key={idx}
            className={`${styles.pill} ${idx === currentIndex ? styles.pillActive : ''} ${answeredIndexes.has(idx) ? styles.pillAnswered : ''}`}
            onClick={() => setCurrentIndex(idx)}
            type="button"
            aria-label={`Question ${idx + 1}${answeredIndexes.has(idx) ? ', answered' : ''}`}
          />
        ))}
      </div>

      <QuestionContainer
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        isRevealed={false}
        showTranslation={false}
        onSelect={handleSelect}
        randomizeOptions={randomizeOptions}
        showGoogleSearch={false}
      />

      <div className={styles.actions}>
        {currentIndex > 0 && (
          <button className={styles.button} onClick={handlePrevious} type="button">
            Previous
          </button>
        )}
        {!isLastQuestion && (
          <button className={styles.button} onClick={handleNext} type="button">
            Next
          </button>
        )}
        {isLastQuestion && (
          <button
            className={`${styles.button} ${styles.finishButton}`}
            onClick={handleFinish}
            disabled={!allAnswered}
            type="button"
            title={allAnswered ? 'Submit exam' : `${questions.length - answeredCount} questions unanswered`}
          >
            Finish Exam
          </button>
        )}
      </div>
    </div>
  );
}
