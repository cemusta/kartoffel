import { HTMLAttributes, useState } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer } from '../QuestionContainer';
import { FactModal } from '../FactModal';
import { TranslationToggle } from '../TranslationToggle';
import styles from './QuizQuestionContainer.module.css';

export interface QuizQuestionContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  passingScore?: number;
  onComplete?: (score: number, correctIds: number[], incorrectIds: number[]) => void;
  randomizeOptions?: boolean;
}

export function QuizQuestionContainer({
  questions,
  passingScore,
  onComplete,
  randomizeOptions = false,
  className = '',
  ...props
}: QuizQuestionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const handleSelect = (key: string) => {
    setAnswers(prev => new Map(prev).set(currentIndex, key));
  };

  const handleCheck = () => {
    setRevealedQuestions(prev => new Set(prev).add(currentIndex));
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setAnsweredCorrect(prev => [...prev, currentQuestion.id]);
    } else {
      setAnsweredIncorrect(prev => [...prev, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setFinished(true);
      onComplete?.(answeredCorrect.length, answeredCorrect, answeredIncorrect);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers(new Map());
    setRevealedQuestions(new Set());
    setAnsweredCorrect([]);
    setAnsweredIncorrect([]);
    setFinished(false);
  };

  const hasTranslation = Boolean(currentQuestion?.translations?.en);
  const factContext = currentQuestion?.translations?.en?.context;

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
