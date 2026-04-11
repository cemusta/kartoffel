import { HTMLAttributes, ReactNode } from 'react';
import styles from './TopBar.module.css';

export interface TopBarProps extends HTMLAttributes<HTMLDivElement> {
  left?: ReactNode;
  right?: ReactNode;
}

export function TopBar({ left, right, className = '', ...props }: TopBarProps) {
  return (
    <div className={`${styles.topBar} ${className}`} {...props}>
      {left !== undefined && <div className={styles.section}>{left}</div>}
      {right !== undefined && <div className={styles.section}>{right}</div>}
    </div>
  );
}
