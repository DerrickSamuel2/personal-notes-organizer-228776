import styles from "../styles/TagSidebar.module.css";

/**
 * Sidebar tag filter list.
 */
export default function TagSidebar({ tags, notes, selectedTag, onSelectTag, disabled }) {
  const counts = new Map();
  for (const n of notes || []) {
    for (const t of n.tags || []) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }

  const sorted = [...(tags || [])].sort((a, b) => a.localeCompare(b));

  return (
    <div className={styles.wrap}>
      {sorted.length === 0 ? (
        <div className={styles.empty}>No tags yet.</div>
      ) : (
        <ul className={styles.list}>
          {sorted.map((t) => {
            const isSelected = t === selectedTag;
            const count = counts.get(t) || 0;

            return (
              <li key={t} className={styles.item}>
                <button
                  type="button"
                  className={`${styles.tagButton} ${isSelected ? styles.selected : ""}`}
                  onClick={() => onSelectTag(t)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                >
                  <span className={styles.tagName}>{t}</span>
                  <span className={styles.count}>{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
