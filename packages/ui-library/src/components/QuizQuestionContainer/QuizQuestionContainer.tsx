import { HTMLAttributes, useState } from 'react';
import { Question, QuestionData } from '../Question';
import { Answer } from '../Answer';
import { FactModal } from '../FactModal';
import { TranslationToggle } from '../TranslationToggle';
import styles from './QuizQuestionContainer.module.css';

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;
const OPTION_LABELS: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

export interface QuizQuestionContainerProps extends HTMLAttributes<HTMLDivElement> {
  questions: QuestionData[];
  onComplete?: (score: number) => void;
}

export function QuizQuestionContainer({
  questions,
  onComplete,
  className = '',
  ...props
}: QuizQuestionContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFact, setShowFact] = useState(false);

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

  const hasTranslation = Boolean(currentQuestion?.translations?.en);
  const factContext = currentQuestion?.translations?.en?.context;

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

      <Question
        text={currentQuestion.text}
        textEn={currentQuestion.translations?.en?.text}
        imageUrl={currentQuestion.image}
        imageText={currentQuestion.imageText}
        showTranslation={showTranslation}
      />

      <div className={styles.options}>
        {OPTION_KEYS.map(key => (
          <Answer
            key={key}
            label={OPTION_LABELS[key]}
            text={currentQuestion.options[key]}
            textEn={currentQuestion.translations?.en?.options?.[key]}
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
