import { useState } from 'react';
import { TopBar } from '../TopBar';
import styles from './RealExamIntroPage.module.css';

export interface RealExamIntroPageProps {
  seed: string;
  shareUrl: string;
  onBack: () => void;
  onStart: () => void;
  onChangeSeed?: () => void;
}

export function RealExamIntroPage({ seed, shareUrl, onBack, onStart, onChangeSeed }: RealExamIntroPageProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            <p className={styles.topBarTitle}>Real Exam</p>
          </>
        }
      />
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <span className={styles.heroIcon}>🎓</span>
          <h2 className={styles.heroTitle}>Real Exam Simulation</h2>
          <p className={styles.heroSubtitle}>
            This is a faithful imitation of the official Einbürgerungstest.
          </p>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>How it works</h3>
          <ul className={styles.infoList}>
            <li>33 questions — 30 general + 3 for your state</li>
            <li>Answer all questions before submitting</li>
            <li>You can go back and change any answer at any time</li>
            <li>No hints, no translations — just like the real test</li>
            <li>Passing score: 17 out of 33 correct answers</li>
            <li>Time limit: 60 minutes (not enforced here)</li>
          </ul>
        </div>

        <div className={styles.seedCard}>
          <p className={styles.seedLabel}>Exam Code</p>
          <div className={styles.seedRow}>
            <p className={styles.seedValue}>{seed}</p>
            {onChangeSeed && (
              <button
                className={styles.changeButton}
                onClick={onChangeSeed}
                type="button"
                aria-label="Generate a new exam code"
              >
                ↻ New Code
              </button>
            )}
          </div>
          <p className={styles.seedHint}>
            Share the link below so others can take the exact same exam.
          </p>
          <div className={styles.shareRow}>
            <input
              className={styles.shareInput}
              readOnly
              value={shareUrl}
              onFocus={e => e.currentTarget.select()}
              aria-label="Shareable exam link"
            />
            <button className={styles.copyButton} onClick={handleCopy} type="button">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <button className={styles.startButton} onClick={onStart} type="button">
          Start Exam
        </button>
      </div>
    </div>
  );
}
