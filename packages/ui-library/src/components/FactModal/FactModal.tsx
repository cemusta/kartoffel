import { useEffect } from 'react';
import styles from './FactModal.module.css';

export interface FactModalProps {
  fact: string;
  onDismiss: () => void;
}

export function FactModal({ fact, onDismiss }: FactModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onDismiss]);

  return (
    <div className={styles.overlay} onClick={onDismiss} role="dialog" aria-modal="true">
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <p className={styles.emoji}>💡</p>
        <p className={styles.fact}>{fact}</p>
        <p className={styles.hint}>Tap anywhere to close</p>
      </div>
    </div>
  );
}
