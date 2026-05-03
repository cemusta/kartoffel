import styles from './StateSelector.module.css';

export interface StateSelectorProps {
  value: string | null;
  onChange: (state: string) => void;
  states: readonly string[];
}

export function StateSelector({ value, onChange, states }: StateSelectorProps) {
  return (
    <div className={styles.wrapper}>
      <select
        className={styles.select}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        aria-label="Select your state"
      >
        <option value="" disabled>
          Select your state…
        </option>
        {states.map(state => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      <span className={styles.chevron} aria-hidden="true">
        ▾
      </span>
    </div>
  );
}
