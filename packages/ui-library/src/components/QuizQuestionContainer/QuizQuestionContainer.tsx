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
}

export function QuizQuestionContainer({
  questions,
  passingScore,
  onComplete,
  className = '',
  ...props
}: QuizQuestionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answeredCorrect, setAnsweredCorrect] = useState<number[]>([]);
  const [answeredIncorrect, setAnsweredIncorrect] = useState<number[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFact, setShowFact] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (key: string) => {
    setSelectedAnswer(key);
    setIsRevealed(false);
  };

  const handleCheck = () => {
    setIsRevealed(true);
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
      setSelectedAnswer(null);
      setIsRevealed(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
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
      />

      <div className={styles.actions}>
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
