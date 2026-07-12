import { useState } from 'react';
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

  const hasAnyTranslation = questions.some(q => Boolean(q.translations?.en));

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
      <div className={styles.content}>
        <AllQuestionsContainer
          questions={questions}
          randomizeOptions={randomizeOptions}
          showTranslation={showTranslation}
        />
      </div>
    </div>
  );
}
