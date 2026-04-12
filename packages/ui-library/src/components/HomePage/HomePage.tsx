import { ModeCard } from '../ModeCard';
import { TopBar } from '../TopBar';
import { HamburgerMenu } from '../HamburgerMenu';
import styles from './HomePage.module.css';

export interface HomePageProps {
  username: string | null;
  onBurgerTest: () => void;
  onLogout: () => void;
}

export function HomePage({ username, onBurgerTest, onLogout }: HomePageProps) {
  return (
    <div className={styles.screen}>
      <TopBar
        left={<p className={styles.appTitle}>Kartoffel</p>}
        right={<HamburgerMenu username={username} onLogout={onLogout} />}
      />

      <div className={styles.content}>
        <h2 className={styles.greeting}>Hey, {username ?? 'there'} 👋</h2>
        <p className={styles.subtitle}>What would you like to practice today?</p>

        <p className={styles.sectionLabel}>Practice Modes</p>

        <div className={styles.modeCardGrid}>
          <ModeCard
            title="Burger Test"
            description="Test your German citizenship knowledge"
            icon="🍔"
            onClick={onBurgerTest}
          />

          <ModeCard
            title="Flash Cards"
            description="Memorize key facts with spaced repetition"
            icon="🃏"
            disabled
          />
        </div>
      </div>
    </div>
  );
}
