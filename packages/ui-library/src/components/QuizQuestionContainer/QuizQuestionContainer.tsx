import { HTMLAttributes, useState, useEffect, useCallback, useMemo } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer, shuffleArray, OPTION_KEYS } from '../QuestionContainer';
import { FactModal } from '../FactModal';
import { TranslationToggle } from '../TranslationToggle';
import { QuestionStatusBadge, QuestionStatus } from '../QuestionStatusBadge';
import styles from './QuizQuestionContainer.module.css';

export interface QuizQuestionContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  passingScore?: number;
  onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
  randomizeOptions?: boolean;
  showGoogleSearch?: boolean;
  keepTranslationsOn?: boolean;
  questionAnswers?: Record<number, boolean[]>;
}

export function QuizQuestionContainer({
  questions,
  passingScore,
  onComplete,
  randomizeOptions = false,
  showGoogleSearch = true,
  keepTranslationsOn = false,
  questionAnswers,
  className = '',
  ...props
}: QuizQuestionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [maxIndexReached, setMaxIndexReached] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [revealedQuestions, setRevealedQuestions] = useState<Set<number>>(new Set());
  const [answeredCorrect, setAnsweredCorrect] = useState<number[]>([]);
  const [answeredIncorrect, setAnsweredIncorrect] = useState<number[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const selectedAnswer = answers.get(currentIndex) ?? null;
  const isRevealed = revealedQuestions.has(currentIndex);

  // Calculate question status based on history
  const questionStatus: QuestionStatus | null = useMemo(() => {
    if (!questionAnswers) return null;
    const answers = questionAnswers[currentQuestion.id];
    if (!answers || answers.length === 0) return 'new';
    return answers.at(-1) === true ? 'correct' : 'wrong';
  }, [currentQuestion.id, questionAnswers]);

  const handleSelect = useCallback((key: string) => {
    setAnswers(prev => new Map(prev).set(currentIndex, key));
  }, [currentIndex]);

  const handleCheck = useCallback(() => {
    setRevealedQuestions(prev => new Set(prev).add(currentIndex));
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setAnsweredCorrect(prev => [...prev, currentQuestion.id]);
    } else {
      setAnsweredIncorrect(prev => [...prev, currentQuestion.id]);
    }
  }, [currentIndex, selectedAnswer, currentQuestion]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setFinished(true);
      onComplete?.(answeredCorrect.length, answeredCorrect, answeredIncorrect);
    } else {
      const nextIndex = currentIndex + 1;
      const isNewQuestion = nextIndex > maxIndexReached;
      if (!keepTranslationsOn && isNewQuestion) {
        setShowTranslation(false);
      }
      setMaxIndexReached(prev => Math.max(prev, nextIndex));
      setCurrentIndex(nextIndex);
    }
  }, [isLastQuestion, onComplete, answeredCorrect, answeredIncorrect, keepTranslationsOn, currentIndex, maxIndexReached]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleReset = () => {
    setCurrentIndex(0);
    setMaxIndexReached(0);
    setAnswers(new Map());
    setRevealedQuestions(new Set());
    setAnsweredCorrect([]);
    setAnsweredIncorrect([]);
    setFinished(false);
  };

  const hasTranslation = Boolean(currentQuestion?.translations?.en);
  const factContext = currentQuestion?.translations?.en?.context;

  // Keyboard shortcuts
  useEffect(() => {
    if (finished || showFact) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      // T - Toggle translation
      if (key === 't' && hasTranslation) {
        e.preventDefault();
        setShowTranslation(prev => !prev);
        return;
      }

      // F - Show fact
      if (key === 'f' && factContext) {
        e.preventDefault();
        setShowFact(true);
        return;
      }

      // Left arrow - Previous question
      if (key === 'arrowleft') {
        e.preventDefault();
        handlePrevious();
        return;
      }

      // Right arrow - Next question (only if revealed)
      if (key === 'arrowright' && isRevealed) {
        e.preventDefault();
        handleNext();
        return;
      }

      // Enter - Check answer
      if (key === 'enter' && selectedAnswer && !isRevealed) {
        e.preventDefault();
        handleCheck();
        return;
      }

      // 1-4 - Select answers A-D in visual (possibly shuffled) order
      if (!isRevealed) {
        const numKey = parseInt(key, 10);
        if (numKey >= 1 && numKey <= 4) {
          e.preventDefault();
          const visualKeys =
            randomizeOptions && !currentQuestion.image
              ? shuffleArray([...OPTION_KEYS], currentQuestion.id)
              : [...OPTION_KEYS];
          handleSelect(visualKeys[numKey - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    finished,
    showFact,
    hasTranslation,
    factContext,
    isRevealed,
    selectedAnswer,
    handleSelect,
    handleCheck,
    handleNext,
    handlePrevious,
    randomizeOptions,
    currentQuestion,
  ]);

  if (finished) {
    const score = answeredCorrect.length;
    const passed = passingScore !== undefined ? score >= passingScore : undefined;
    return (
      <div className={`${styles.container} ${className}`} {...props}>
        <div className={styles.results}>
          <h2 className={styles.resultsTitle}>Quiz Complete!</h2>
          <p className={styles.score}>
            Score: {score} / {questions.length}
          </p>
          <p className={styles.percentage}>{Math.round((score / questions.length) * 100)}%</p>
          {passed !== undefined && (
            <p className={passed ? styles.passed : styles.failed}>
              {passed ? '✓ Passed' : '✗ Failed'}
              {passingScore !== undefined && (
                <span className={styles.passingHint}> · {passingScore} correct answers needed</span>
              )}
            </p>
          )}
          <button className={styles.button} onClick={handleReset}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      {showFact && factContext && (
        <FactModal fact={factContext} onDismiss={() => setShowFact(false)} />
      )}
      <div className={styles.header}>
        <span className={styles.progress}>
          Question {currentIndex + 1} of {questions.length}
          {questionStatus && (
            <>
              {' '}
              <QuestionStatusBadge status={questionStatus} />
            </>
          )}
        </span>
        <div className={styles.controls}>
          <button
            className={styles.factButton}
            onClick={() => setShowFact(true)}
            disabled={!factContext}
            type="button"
            title={factContext ? 'Show a fact about this question' : 'No fact available'}
          >
            💡 Fact
          </button>
          {hasTranslation && (
            <TranslationToggle checked={showTranslation} onChange={setShowTranslation} />
          )}
        </div>
      </div>

      <QuestionContainer
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        isRevealed={isRevealed}
        showTranslation={showTranslation}
        onSelect={handleSelect}
        randomizeOptions={randomizeOptions}
        showGoogleSearch={showGoogleSearch}
      />

      <div className={styles.actions}>
        {currentIndex > 0 && (
          <button className={styles.button} onClick={handlePrevious}>
            Previous Question
          </button>
        )}
        {!isRevealed ? (
          <button
            className={styles.button}
            onClick={handleCheck}
            disabled={selectedAnswer === null}
          >
            Check Answer
          </button>
        ) : (
          <button className={styles.button} onClick={handleNext}>
            {isLastQuestion ? 'Finish' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}
