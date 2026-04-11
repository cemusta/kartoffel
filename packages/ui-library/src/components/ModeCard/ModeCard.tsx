import React from 'react';
import styles from './ModeCard.module.css';

export interface ModeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function ModeCard({ title, description, icon, disabled = false, onClick }: ModeCardProps) {
  return (
    <button
      className={`${styles.modeCard} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={disabled}
      type="button"
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </span>
      {!disabled && <span className={styles.arrow}>›</span>}
    </button>
  );
}
