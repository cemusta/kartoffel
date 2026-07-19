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
  onClearProgress: () => void;
  states: readonly string[];
  showGoogleSearch: boolean;
  onShowGoogleSearchChange: (show: boolean) => void;
  keepTranslationsOn: boolean;
  onKeepTranslationsOnChange: (on: boolean) => void;
}

export function SettingsPage({
  username,
  selectedState,
  onStateChange,
  onBack,
  onLogout,
  onSettings,
  onClearProgress,
  states,
  showGoogleSearch,
  onShowGoogleSearchChange,
  keepTranslationsOn,
  onKeepTranslationsOnChange,
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

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Questions</h2>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <p className={styles.settingLabel}>Show Google Search Button</p>
              <p className={styles.settingDescription}>
                Display a search button in the top-right of each question
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={showGoogleSearch}
                onChange={e => onShowGoogleSearchChange(e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <p className={styles.settingLabel}>Keep Translations On</p>
              <p className={styles.settingDescription}>
                When enabled, the English translation stays visible when moving to the next question
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={keepTranslationsOn}
                onChange={e => onKeepTranslationsOnChange(e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Progress</h2>
          <p className={styles.sectionDescription}>
            Reset your practice history. This will clear all correct and incorrect answer records.
          </p>
          <button className={styles.clearProgressButton} onClick={onClearProgress} type="button">
            Clear Progress
          </button>
        </section>
      </div>
    </div>
  );
}
