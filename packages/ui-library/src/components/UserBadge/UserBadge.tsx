import styles from './UserBadge.module.css';

export interface UserBadgeProps {
  username: string;
}

export function UserBadge({ username }: UserBadgeProps) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <div className={styles.badge}>
      <span className={styles.avatar}>{initial}</span>
      <span className={styles.username}>{username}</span>
    </div>
  );
}
