import styles from './RandomizeToggle.module.css';

export interface RandomizeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RandomizeToggle({ checked, onChange }: RandomizeToggleProps) {
  return (
    <label className={styles.randomizeSwitch} aria-label="Toggle randomized answer options">
      <svg
        className={styles.randomizeIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 3h5v5" />
        <path d="M4 20L21 3" />
        <path d="M21 16v5h-5" />
        <path d="M15 15l6 6" />
        <path d="M4 4l5 5" />
      </svg>
      <span className={styles.toggleTrack}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className={styles.toggleInput}
        />
        <span className={styles.toggleThumb} />
      </span>
    </label>
  );
}
