import { TopBar } from '../TopBar';
import styles from './BurgerTestPage.module.css';

export interface BurgerTestPageProps {
  onBack: () => void;
}

export function BurgerTestPage({ onBack }: BurgerTestPageProps) {
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
      />
      <div className={styles.content}>
        <span className={styles.icon}>🍔</span>
        <h2 className={styles.title}>Coming Soon</h2>
        <p className={styles.subtitle}>Questions are loading soon. Get ready to become German!</p>
      </div>
    </div>
  );
}
