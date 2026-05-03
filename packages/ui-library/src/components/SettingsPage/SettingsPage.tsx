import { TopBar } from '../TopBar';
import { HamburgerMenu } from '../HamburgerMenu';
import { UserBadge } from '../UserBadge';
import { StateSelector } from '../StateSelector';
import styles from './SettingsPage.module.css';

export interface SettingsPageProps {
  username: string;
  selectedState: string | null;
  onStateChange: (state: string) => void;
  onBack: () => void;
  onLogout: () => void;
  onSettings: () => void;
  states: readonly string[];
}

export function SettingsPage({
  username,
  selectedState,
  onStateChange,
  onBack,
  onLogout,
  onSettings,
  states,
}: SettingsPageProps) {
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
            <p className={styles.topBarTitle}>Settings</p>
          </>
        }
        right={<HamburgerMenu username={username} onLogout={onLogout} onSettings={onSettings} />}
      />

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Your Account</h2>
          <div className={styles.accountCard}>
            <UserBadge username={username} />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Location</h2>
          <p className={styles.sectionDescription}>
            Your state determines which 10 additional questions are included in the quiz.
          </p>
          <StateSelector value={selectedState} onChange={onStateChange} states={states} />
        </section>
      </div>
    </div>
  );
}
