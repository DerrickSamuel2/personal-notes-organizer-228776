import { useEffect, useMemo, useState } from "react";
import styles from "../styles/NoteEditor.module.css";

/**
 * Detail/editor panel for a selected note.
 */
export default function NoteEditor({ note, onSave, saving }) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tagsInput, setTagsInput] = useState(Array.isArray(note?.tags) ? note.tags.join(", ") : "");

  const parsedTags = useMemo(() => {
    const parts = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Deduplicate while preserving order
    const seen = new Set();
    const deduped = [];
    for (const t of parts) {
      if (!seen.has(t)) {
        seen.add(t);
        deduped.push(t);
      }
    }
    return deduped;
  }, [tagsInput]);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setTagsInput(Array.isArray(note?.tags) ? note.tags.join(", ") : "");
  }, [note]);

  if (!note) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyTitle}>Select a note</div>
        <div className={styles.emptyBody}>
          Choose a note from the list, or click <strong>New note</strong> to create one.
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave({
      title: title.trim() || "Untitled",
      content,
      tags: parsedTags
    });
  }

  return (
    <form className={styles.editor} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="note-title">
          Title
        </label>
        <input
          id="note-title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          placeholder="Note title"
        />
      </div>

      <div className={styles.row}>
        <label className={styles.label} htmlFor="note-tags">
          Tags (comma-separated)
        </label>
        <input
          id="note-tags"
          className={styles.input}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          disabled={saving}
          placeholder="work, personal, ideas"
        />
        <div className={styles.tagChips} aria-label="Parsed tags preview">
          {parsedTags.length > 0 ? (
            parsedTags.map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))
          ) : (
            <span className={styles.chipEmpty}>No tags</span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.label} htmlFor="note-content">
          Content
        </label>
        <textarea
          id="note-content"
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={saving}
          placeholder="Write your note…"
          rows={14}
        />
      </div>

      <div className={styles.footer}>
        <button className={styles.saveButton} type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        <div className={styles.hint}>
          Tip: use tags to organize and filter notes from the left sidebar.
        </div>
      </div>
    </form>
  );
}
