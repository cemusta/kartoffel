import { ModeCard } from '../ModeCard';
import { TopBar } from '../TopBar';
import { HamburgerMenu } from '../HamburgerMenu';
import { ProgressGrid } from '../ProgressGrid';
import { FactCallout } from '../FactCallout';
import styles from './BurgerTestPage.module.css';

export interface BurgerTestPageProps {
  onBack: () => void;
  username: string | null;
  onLogout: () => void;
  onSettings?: () => void;
  onShowAllQuestions: () => void;
  onStartPractice?: () => void;
  userState: string | null;
  allQuestionIds?: number[];
  correctQuestionIds?: number[];
  incorrectQuestionIds?: number[];
}

export function BurgerTestPage({
  onBack,
  username,
  onLogout,
  onSettings,
  onShowAllQuestions,
  onStartPractice,
  userState,
  allQuestionIds,
  correctQuestionIds = [],
  incorrectQuestionIds = [],
}: BurgerTestPageProps) {
  const questionCount = userState ? 310 : 300;
  const questionDescription = userState
    ? `${questionCount} questions including ${userState}`
    : `${questionCount} general questions`;

  const practiceEnabled = Boolean(onStartPractice && userState);

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
            <p className={styles.topBarTitle}>Burger Test</p>
          </>
        }
        right={<HamburgerMenu username={username} onLogout={onLogout} onSettings={onSettings} />}
      />
      <div className={styles.content}>
        <h2 className={styles.sectionLabel}>Practice Modes</h2>
        <div className={styles.modeCardGrid}>
          <ModeCard
            title="Show All Questions"
            description={questionDescription}
            icon="📋"
            onClick={onShowAllQuestions}
          />
          <ModeCard
            title="Practice Mode"
            description={
              practiceEnabled
                ? '33 questions · passing score 17/33'
                : 'Select a state to start practice'
            }
            icon="🎯"
            disabled={!practiceEnabled}
            onClick={practiceEnabled ? onStartPractice : undefined}
          />
        </div>
        {allQuestionIds && allQuestionIds.length > 0 && (
          <div className={styles.progressSection}>
            <h2 className={styles.sectionLabel}>Your Progress</h2>
            <ProgressGrid
              allQuestionIds={allQuestionIds}
              correctIds={correctQuestionIds}
              incorrectIds={incorrectQuestionIds}
            />
          </div>
        )}
        <FactCallout text="Historically, the success rate is over 98%, as the questions are public and can be practiced in advance." />
      </div>
    </div>
  );
}
