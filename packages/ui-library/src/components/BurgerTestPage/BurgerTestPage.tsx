import { ModeCard } from '../ModeCard';
import { TopBar } from '../TopBar';
import { HamburgerMenu } from '../HamburgerMenu';
import styles from './BurgerTestPage.module.css';

export interface BurgerTestPageProps {
  onBack: () => void;
  username: string | null;
  onLogout: () => void;
  onSettings?: () => void;
  onShowAllQuestions: () => void;
  userState: string | null;
}

export function BurgerTestPage({
  onBack,
  username,
  onLogout,
  onSettings,
  onShowAllQuestions,
  userState,
}: BurgerTestPageProps) {
  const questionCount = userState ? 310 : 300;
  const questionDescription = userState
    ? `${questionCount} questions including ${userState}`
    : `${questionCount} general questions`;

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
            description="Randomised sessions with spaced repetition"
            icon="🎯"
            disabled
          />
        </div>
      </div>
    </div>
  );
}
