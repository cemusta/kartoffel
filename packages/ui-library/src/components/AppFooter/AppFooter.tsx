import styles from './AppFooter.module.css';

export interface AppFooterProps {
  version: string;
}

export function AppFooter({ version }: AppFooterProps) {
  return (
    <div className={styles.footer}>
      <p className={styles.version}>made with ❤️ - v{version}</p>
      <div className={styles.links}>
        <a
          href="https://github.com/cemusta/kartoffel"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Project
        </a>
        <a
          href="https://cemusta.github.io/kartoffel/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="2 0 28 40">
            <defs>
              <path id="sb-icon" d="M26.5 0h-21C3.6 0 2 1.7 2 3.7V36c0 2 1.6 3.7 3.5 3.7h21c2 0 3.5-1.7 3.5-3.7V3.7C30 1.7 28.4 0 26.5 0z" />
            </defs>
            <mask id="sb-mask" fill="#fff"><use href="#sb-icon" /></mask>
            <use fill="#FF4785" fillRule="nonzero" href="#sb-icon" />
            <path d="M23.7 5L24 .2l3.9-.3.1 4.8a.3.3 0 0 1-.5.2L26 3.8l-1.7 1.4a.3.3 0 0 1-.5-.3zm-5 10c0 .9 5.3.5 6 0 0-5.4-2.8-8.2-8-8.2-5.3 0-8.2 2.8-8.2 7.1 0 7.4 10 7.6 10 11.6 0 1.2-.5 1.9-1.8 1.9-1.6 0-2.2-.9-2.1-3.6 0-.6-6.1-.8-6.3 0-.5 6.7 3.7 8.6 8.5 8.6 4.6 0 8.3-2.5 8.3-7 0-7.9-10.2-7.7-10.2-11.6 0-1.6 1.2-1.8 2-1.8.6 0 2 0 1.9 3z" fill="#FFF" fillRule="nonzero" mask="url(#sb-mask)" />
          </svg>
          Storybook
        </a>
      </div>
    </div>
  );
}
