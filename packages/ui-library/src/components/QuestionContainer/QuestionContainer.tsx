import { HTMLAttributes, useState } from 'react';
import { Question, QuestionData } from '../Question';
import { Answer } from '../Answer';
import styles from './QuestionContainer.module.css';

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;
const OPTION_LABELS: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

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
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (key: string) => {
    setSelectedAnswer(key);
    setIsRevealed(false);
  };

  const handleCheck = () => {
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore = questions.reduce((acc, q, idx) => {
        const answer = idx === currentIndex ? selectedAnswer : null;
        return answer === q.correctAnswer ? acc + 1 : acc;
      }, 0);
      setScore(finalScore);
      onComplete?.(finalScore);
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
    setScore(null);
  };

  const hasTranslation = Boolean(currentQuestion?.textEn);

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
        {hasTranslation && (
          <label className={styles.translationSwitch} aria-label="Toggle English translation">
            <svg
              className={styles.translateIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 8l6 6" />
              <path d="M4 14l6-6 2-3" />
              <path d="M2 5h12" />
              <path d="M7 2h1" />
              <path d="M22 22l-5-10-5 10" />
              <path d="M14 18h6" />
            </svg>
            <span className={styles.toggleTrack}>
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={e => setShowTranslation(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleThumb} />
            </span>
          </label>
        )}
      </div>

      <Question
        text={currentQuestion.text}
        textEn={currentQuestion.textEn}
        imageUrl={currentQuestion.image}
        showTranslation={showTranslation}
      />

      <div className={styles.options}>
        {OPTION_KEYS.map(key => (
          <Answer
            key={key}
            label={OPTION_LABELS[key]}
            text={currentQuestion.options[key]}
            textEn={currentQuestion.optionsEn?.[key]}
            isSelected={selectedAnswer === key}
            isCorrect={key === currentQuestion.correctAnswer}
            isRevealed={isRevealed}
            showTranslation={showTranslation}
            onSelect={() => handleSelect(key)}
          />
        ))}
      </div>

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
