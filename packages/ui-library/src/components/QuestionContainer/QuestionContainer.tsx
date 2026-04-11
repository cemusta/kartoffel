import { HTMLAttributes, useState } from 'react';
import { Question, QuestionData, AnswerOption } from '../Question';
import { Answer } from '../Answer';
import styles from './QuestionContainer.module.css';

// Helper to normalize option to string for comparison
function normalizeOption(option: string | AnswerOption): string {
  return typeof option === 'string' ? option : option.text || option.imageUrl || '';
}

export interface QuestionContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  onComplete?: (score: number) => void;
}

export function QuestionContainer({
  questions,
  onComplete,
  className = '',
  ...props
}: QuestionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
    setIsRevealed(false);
  };

  const handleCheck = () => {
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate final score
      const finalScore = questions.reduce((acc, q) => {
        const correctAnswer = normalizeOption(q.correctAnswer);
        return selectedAnswers[q.id] === correctAnswer ? acc + 1 : acc;
      }, 0);
      setScore(finalScore);
      onComplete?.(finalScore);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsRevealed(false);
    setScore(null);
  };

  if (score !== null) {
    return (
      <div className={`${styles.container} ${className}`} {...props}>
        <div className={styles.results}>
          <h2 className={styles.resultsTitle}>Quiz Complete!</h2>
          <p className={styles.score}>
            Score: {score} / {questions.length}
          </p>
          <p className={styles.percentage}>{Math.round((score / questions.length) * 100)}%</p>
          <button className={styles.button} onClick={handleReset}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <div className={styles.header}>
        <span className={styles.progress}>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <Question text={currentQuestion.text} imageUrl={currentQuestion.imageUrl} />

      <div className={styles.options}>
        {currentQuestion.options.map((option, index) => {
          const optionKey = normalizeOption(option);
          const isString = typeof option === 'string';
          const correctAnswer = normalizeOption(currentQuestion.correctAnswer);

          return (
            <Answer
              key={`${optionKey}-${index}`}
              text={isString ? option : option.text}
              imageUrl={isString ? undefined : option.imageUrl}
              isSelected={selectedAnswers[currentQuestion.id] === optionKey}
              isCorrect={optionKey === correctAnswer}
              isRevealed={isRevealed}
              onSelect={() => handleSelect(optionKey)}
            />
          );
        })}
      </div>

      <div className={styles.actions}>
        {!isRevealed ? (
          <button
            className={styles.button}
            onClick={handleCheck}
            disabled={!selectedAnswers[currentQuestion.id]}
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
