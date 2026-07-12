import { useEffect, useState } from 'react';
import styles from './FactCallout.module.css';

export interface FactCalloutProps {
  facts: string[];
  icon?: string;
}

const CHAR_INTERVAL_MS = 20;

export function FactCallout({ facts, icon = '💡' }: FactCalloutProps) {
  const [factIndex, setFactIndex] = useState(() =>
    Math.floor(Math.random() * Math.max(facts.length, 1)),
  );
  const [displayedText, setDisplayedText] = useState('');

  const currentFact = facts[factIndex] ?? '';
  const isTyping = displayedText.length < currentFact.length;

  useEffect(() => {
    let index = 0;

    const id = setInterval(() => {
      index += 1;
      setDisplayedText(currentFact.slice(0, index));
      if (index >= currentFact.length) {
        clearInterval(id);
      }
    }, CHAR_INTERVAL_MS);

    return () => clearInterval(id);
  }, [currentFact]);

  const handleNext = () => {
    if (isTyping) return;
    setDisplayedText('');
    setFactIndex(i => (i + 1) % facts.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      className={`${styles.factCallout} ${!isTyping ? styles.clickable : ''}`}
      onClick={handleNext}
      role={!isTyping ? 'button' : undefined}
      tabIndex={!isTyping ? 0 : undefined}
      aria-label={!isTyping ? 'Show next fact' : undefined}
      onKeyDown={!isTyping ? handleKeyDown : undefined}
    >
      <span className={styles.factIcon}>{icon}</span>
      <p className={`${styles.factText} ${isTyping ? styles.typing : ''}`}>
        {displayedText}
      </p>
    </div>
  );
}
