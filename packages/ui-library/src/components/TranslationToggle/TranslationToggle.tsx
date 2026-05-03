import styles from './TranslationToggle.module.css';

export interface TranslationToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TranslationToggle({ checked, onChange }: TranslationToggleProps) {
  return (
    <label className={styles.translationSwitch} aria-label="Toggle English translation">
      <svg
        className={styles.translateIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8l6 6" />
        <path d="M4 14l6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="M22 22l-5-10-5 10" />
        <path d="M14 18h6" />
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
