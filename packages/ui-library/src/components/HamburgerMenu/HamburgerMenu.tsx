import { useEffect, useRef, useState } from 'react';
import { UserBadge } from '../UserBadge';
import styles from './HamburgerMenu.module.css';

export interface HamburgerMenuProps {
  username: string | null;
  onLogout: () => void;
  onSettings?: () => void;
}

export function HamburgerMenu({ username, onLogout, onSettings }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  function handleLogout() {
    setIsOpen(false);
    onLogout();
  }

  function handleSettings() {
    setIsOpen(false);
    onSettings?.();
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.hamburgerButton}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          {username && (
            <div className={styles.userSection}>
              <UserBadge username={username} />
            </div>
          )}
          {onSettings && (
            <button
              className={styles.settingsButton}
              onClick={handleSettings}
              type="button"
              role="menuitem"
            >
              Settings
            </button>
          )}
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            type="button"
            role="menuitem"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
