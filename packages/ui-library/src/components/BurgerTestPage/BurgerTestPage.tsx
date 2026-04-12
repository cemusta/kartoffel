import { TopBar } from '../TopBar';
import { HamburgerMenu } from '../HamburgerMenu';
import styles from './BurgerTestPage.module.css';

export interface BurgerTestPageProps {
  onBack: () => void;
  username: string | null;
  onLogout: () => void;
}

export function BurgerTestPage({ onBack, username, onLogout }: BurgerTestPageProps) {
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
        right={<HamburgerMenu username={username} onLogout={onLogout} />}
      />
      <div className={styles.content}>
        <span className={styles.icon}>🍔</span>
        <h2 className={styles.title}>Coming Soon</h2>
        <p className={styles.subtitle}>Questions are loading soon. Get ready to become German!</p>
      </div>
    </div>
  );
}
