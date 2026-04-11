import { Button } from '../Button';
import styles from './OnboardingPage.module.css';

export interface OnboardingPageProps {
  onContinueAnonymous: () => void;
  logoSrc?: string;
}

export function OnboardingPage({
  onContinueAnonymous,
  logoSrc = '/logo.png',
}: OnboardingPageProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <img
          src={logoSrc}
          alt="Kartoffel logo"
          className={styles.logo}
          onError={e => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className={styles.tagline}>
          <h1>Kartoffel</h1>
          <p>Become German, one question at a time.</p>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" size="large" onClick={onContinueAnonymous}>
          Continue Anonymously
        </Button>

        <div className={styles.divider}>or</div>

        <div className={styles.secondaryActions}>
          <Button variant="secondary" size="medium" disabled title="Coming soon">
            Login
          </Button>
          <Button variant="secondary" size="medium" disabled title="Coming soon">
            Register
          </Button>
        </div>
        <p className={styles.comingSoonHint}>Login &amp; Register coming soon</p>
      </div>
    </div>
  );
}
