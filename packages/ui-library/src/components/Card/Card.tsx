import { HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ title, footer, children, className = '', ...props }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {title && <div className={styles.header}>{title}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
