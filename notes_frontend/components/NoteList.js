import styles from "../styles/NoteList.module.css";

/**
 * Notes list panel.
 */
export default function NoteList({
  loading,
  notes,
  selectedNoteId,
  onSelect,
  onDelete,
  disabled
}) {
  if (loading) {
    return <div className={styles.empty}>Loading notes…</div>;
  }

  if (!notes || notes.length === 0) {
    return <div className={styles.empty}>No notes match the current filters.</div>;
  }

  return (
    <ul className={styles.list}>
      {notes.map((note) => {
        const isSelected = String(note.id) === String(selectedNoteId);
        const title = note.title?.trim() || "Untitled";
        const contentPreview = (note.content || "").trim().slice(0, 120);

        return (
          <li key={note.id} className={styles.item}>
            <button
              type="button"
              className={`${styles.card} ${isSelected ? styles.selected : ""}`}
              onClick={() => onSelect(note.id)}
              disabled={disabled}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardTitle}>{title}</div>
                <div className={styles.cardMeta}>
                  {Array.isArray(note.tags) && note.tags.length > 0 ? note.tags.join(", ") : "—"}
                </div>
              </div>
              <div className={styles.cardBody}>{contentPreview || "No content yet."}</div>
            </button>

            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(note.id)}
              disabled={disabled}
              aria-label={`Delete note "${title}"`}
              title="Delete"
            >
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}
