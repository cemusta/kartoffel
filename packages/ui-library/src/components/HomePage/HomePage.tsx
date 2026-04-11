import { ModeCard } from '../ModeCard';
import { UserBadge } from '../UserBadge';
import styles from './HomePage.module.css';

export interface HomePageProps {
  username: string | null;
  onBurgerTest: () => void;
}

export function HomePage({ username, onBurgerTest }: HomePageProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.topBar}>
        <p className={styles.appTitle}>Kartoffel</p>
        {username && <UserBadge username={username} />}
      </div>

      <div className={styles.content}>
        <h2 className={styles.greeting}>Hey, {username ?? 'there'} 👋</h2>
        <p className={styles.subtitle}>What would you like to practice today?</p>

        <p className={styles.sectionLabel}>Practice Modes</p>

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
  );
}
