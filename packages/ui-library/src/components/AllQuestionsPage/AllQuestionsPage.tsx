import { useState, useEffect, useRef, useCallback } from 'react';
import { QuestionData } from '../QuestionBody';
import { AllQuestionsContainer } from '../AllQuestionsContainer';
import { TopBar } from '../TopBar';
import { TranslationToggle } from '../TranslationToggle';
import styles from './AllQuestionsPage.module.css';

export interface AllQuestionsPageProps {
  questions: QuestionData[];
  onBack: () => void;
  randomizeOptions?: boolean;
}

export function AllQuestionsPage({
  questions,
  onBack,
  randomizeOptions = false,
}: AllQuestionsPageProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const currentQuestionIndexRef = useRef(0);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const hasAnyTranslation = questions.some(q => Boolean(q.translations?.en));

  // Initialize refs array
  useEffect(() => {
    questionRefs.current = questionRefs.current.slice(0, questions.length);
  }, [questions.length]);

  // Scroll to question
  const scrollToQuestion = useCallback((index: number) => {
    const questionEl = questionRefs.current[index];
    if (questionEl && contentRef.current) {
      questionEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          currentQuestionIndexRef.current = Math.max(0, currentQuestionIndexRef.current - 1);
          scrollToQuestion(currentQuestionIndexRef.current);
          break;
        case 'ArrowDown':
          e.preventDefault();
          currentQuestionIndexRef.current = Math.min(
            questions.length - 1,
            currentQuestionIndexRef.current + 1
          );
          scrollToQuestion(currentQuestionIndexRef.current);
          break;
        case 't':
        case 'T':
          if (hasAnyTranslation) {
            e.preventDefault();
            setShowTranslation(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions.length, hasAnyTranslation, scrollToQuestion]);

  return (
    <div className={styles.screen}>
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
            <p className={styles.topBarTitle}>All Questions</p>
          </>
        }
        right={
          hasAnyTranslation ? (
            <TranslationToggle checked={showTranslation} onChange={setShowTranslation} />
          ) : undefined
        }
      />
      <div className={styles.content} ref={contentRef}>
        <AllQuestionsContainer
          questions={questions}
          randomizeOptions={randomizeOptions}
          showTranslation={showTranslation}
          questionRefs={questionRefs}
        />
      </div>
    </div>
  );
}
