import { useState, useEffect, useCallback, useMemo } from 'react';
import { QuestionData } from '../QuestionBody';
import { QuestionContainer, shuffleArray, OPTION_KEYS } from '../QuestionContainer';
import { TranslationToggle } from '../TranslationToggle';
import { FactModal } from '../FactModal';
import { QuestionStatusBadge, QuestionStatus } from '../QuestionStatusBadge';
import { TopBar } from '../TopBar';
import styles from './PracticeModePage.module.css';

export interface PracticeModePageProps {
  question: QuestionData;
  onAnswer: (isCorrect: boolean, questionId: number) => void;
  onBack: () => void;
  keepTranslationsOn?: boolean;
  showGoogleSearch?: boolean;
  randomizeOptions?: boolean;
  questionAnswers?: Record<number, boolean[]>;
}

export function PracticeModePage({
  question,
  onAnswer,
  onBack,
  keepTranslationsOn = false,
  showGoogleSearch = true,
  randomizeOptions = true,
  questionAnswers,
}: PracticeModePageProps) {
  // State is reset via key={question.id} on this component at the call site.
  // The initialiser runs fresh on every remount, avoiding setState-in-effect.
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showTranslation, setShowTranslation] = useState(keepTranslationsOn);
  const [showFact, setShowFact] = useState(false);

  const isCorrect = selectedAnswer === question.correctAnswer;
  const hasTranslation = Boolean(question.translations?.en);
  const factContext = question.translations?.en?.context;

  const questionStatus: QuestionStatus | null = useMemo(() => {
    if (!questionAnswers) return null;
    const history = questionAnswers[question.id];
    if (!history || history.length === 0) return 'new';
    return history[history.length - 1] === true ? 'correct' : 'wrong';
  }, [question.id, questionAnswers]);

  const handleCheck = useCallback(() => {
    if (selectedAnswer === null) return;
    setIsRevealed(true);
  }, [selectedAnswer]);

  const handleNext = useCallback(() => {
    onAnswer(isCorrect, question.id);
  }, [isCorrect, question.id, onAnswer]);

  // Keyboard shortcuts
  useEffect(() => {
    if (showFact) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if (key === 't' && hasTranslation) {
        e.preventDefault();
        setShowTranslation(prev => !prev);
        return;
      }

      if (key === 'f' && factContext) {
        e.preventDefault();
        setShowFact(true);
        return;
      }

      if (key === 'arrowright' && isRevealed) {
        e.preventDefault();
        handleNext();
        return;
      }

      if (key === 'enter' && selectedAnswer !== null && !isRevealed) {
        e.preventDefault();
        handleCheck();
        return;
      }

      if (!isRevealed) {
        const numKey = parseInt(key, 10);
        if (numKey >= 1 && numKey <= 4) {
          e.preventDefault();
          const visualKeys =
            randomizeOptions && !question.image
              ? shuffleArray([...OPTION_KEYS], question.id)
              : [...OPTION_KEYS];
          setSelectedAnswer(visualKeys[numKey - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showFact,
    hasTranslation,
    factContext,
    isRevealed,
    selectedAnswer,
    handleCheck,
    handleNext,
    randomizeOptions,
    question,
  ]);

  return (
    <div className={styles.screen}>
      {showFact && factContext && (
        <FactModal fact={factContext} onDismiss={() => setShowFact(false)} />
      )}
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
            <p className={styles.topBarTitle}>Practice Mode</p>
          </>
        }
      />
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.statusArea}>
              {questionStatus && <QuestionStatusBadge status={questionStatus} />}
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
            question={question}
            selectedAnswer={selectedAnswer}
            isRevealed={isRevealed}
            showTranslation={showTranslation}
            onSelect={setSelectedAnswer}
            randomizeOptions={randomizeOptions}
            showGoogleSearch={showGoogleSearch}
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
                Next Question →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
