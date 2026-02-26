import styles from "../styles/AppLayout.module.css";

/**
 * App shell layout.
 */
export default function AppLayout({ children, onCreateNew, createDisabled, statusText, subtitle }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true">
            N
          </div>
          <div className={styles.brandText}>
            <div className={styles.title}>Notes</div>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.status} title="Backend status">
            <span className={styles.pillDot} aria-hidden="true" />
            <span className={styles.statusText}>{statusText}</span>
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={onCreateNew}
            disabled={createDisabled}
          >
            + New note
          </button>
        </div>
      </header>

      <div className={styles.body}>{children}</div>
    </div>
  );
}
