import { useEffect, useState } from 'react';
import styles from './FactCallout.module.css';

export interface FactCalloutProps {
  text: string;
  icon?: string;
}

const CHAR_INTERVAL_MS = 20;

export function FactCallout({ text, icon = '💡' }: FactCalloutProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;

    const id = setInterval(() => {
      index += 1;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(id);
      }
    }, CHAR_INTERVAL_MS);

    return () => clearInterval(id);
  }, [text]);

  const done = displayedText.length >= text.length;

  return (
    <div className={styles.factCallout}>
      <span className={styles.factIcon}>{icon}</span>
      <p className={`${styles.factText} ${done ? '' : styles.typing}`}>
        {displayedText}
      </p>
    </div>
  );
}
