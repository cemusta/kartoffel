import { useState } from 'react';
import { TopBar } from '../TopBar';
import { Button } from '../Button';
import { StateSelector } from '../StateSelector';
import styles from './StateSelectionPage.module.css';

export interface StateSelectionPageProps {
  onContinue: (state: string) => void;
  onBack: () => void;
  states: readonly string[];
  initialState?: string | null;
}

export function StateSelectionPage({
  onContinue,
  onBack,
  states,
  initialState = null,
}: StateSelectionPageProps) {
  const [selectedState, setSelectedState] = useState<string | null>(initialState ?? null);

  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <button className={styles.backButton} onClick={onBack} aria-label="Go back" type="button">
            ‹
          </button>
        }
      />

      <div className={styles.content}>
        <span className={styles.icon}>📍</span>
        <h1 className={styles.heading}>Where do you live?</h1>
        <p className={styles.subtext}>
          We&apos;ll include 10 state-specific questions in your quiz.
        </p>

        <div className={styles.selectorWrapper}>
          <StateSelector value={selectedState} onChange={setSelectedState} states={states} />
        </div>

        <Button
          variant="primary"
          size="large"
          onClick={() => selectedState && onContinue(selectedState)}
          disabled={!selectedState}
          className={styles.continueButton}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
