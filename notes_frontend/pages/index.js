import { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import NoteEditor from "../components/NoteEditor";
import NoteList from "../components/NoteList";
import SearchBar from "../components/SearchBar";
import TagSidebar from "../components/TagSidebar";
import {
  createNote,
  deleteNote,
  getAllTags,
  getNotes,
  healthCheck,
  updateNote
} from "../services/api";

/**
 * Home page: notes organizer UI.
 * Layout: top nav (create), sidebar (tags), center (list/detail).
 */
export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [backendOk, setBackendOk] = useState(null);

  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedTag, setSelectedTag] = useState(null); // string | null
  const [search, setSearch] = useState("");

  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const selectedNote = useMemo(() => {
    return notes.find((n) => String(n.id) === String(selectedNoteId)) || null;
  }, [notes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    const s = search.trim().toLowerCase();
    return notes.filter((n) => {
      const matchesSearch =
        s.length === 0 ||
        (n.title || "").toLowerCase().includes(s) ||
        (n.content || "").toLowerCase().includes(s);

      const matchesTag =
        !selectedTag ||
        (Array.isArray(n.tags) && n.tags.some((t) => t === selectedTag));

      return matchesSearch && matchesTag;
    });
  }, [notes, search, selectedTag]);

  async function loadAll({ keepSelection = true } = {}) {
    setLoading(true);
    setError("");

    try {
      const [hc, notesResp, tagsResp] = await Promise.all([
        healthCheck().catch(() => ({ ok: false })),
        getNotes(),
        getAllTags()
      ]);

      setBackendOk(Boolean(hc?.ok));
      setNotes(Array.isArray(notesResp) ? notesResp : []);
      setTags(Array.isArray(tagsResp) ? tagsResp : []);

      if (!keepSelection) {
        setSelectedNoteId(null);
      } else {
        // If selected note no longer exists, clear selection.
        const exists = (Array.isArray(notesResp) ? notesResp : []).some(
          (n) => String(n.id) === String(selectedNoteId)
        );
        if (!exists) setSelectedNoteId(null);
      }
    } catch (e) {
      setBackendOk(false);
      setError(
        e?.message ||
          "Failed to load notes. Check backend URL and that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateNew() {
    setSaving(true);
    setError("");

    try {
      const draft = {
        title: "Untitled",
        content: "",
        tags: selectedTag ? [selectedTag] : []
      };
      const created = await createNote(draft);
      await loadAll({ keepSelection: true });
      if (created?.id != null) {
        setSelectedNoteId(created.id);
      }
    } catch (e) {
      setError(e?.message || "Failed to create note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(notePatch) {
    if (!selectedNote) return;

    setSaving(true);
    setError("");
    try {
      const updated = await updateNote(selectedNote.id, notePatch);
      // Update local list for instant UX; then refresh tags list in background.
      setNotes((prev) =>
        prev.map((n) => (String(n.id) === String(updated.id) ? updated : n))
      );
      setSelectedNoteId(updated.id);

      // Refresh tags to keep sidebar counts accurate (non-blocking).
      getAllTags()
        .then((t) => setTags(Array.isArray(t) ? t : []))
        .catch(() => {});
    } catch (e) {
      setError(e?.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId) {
    setSaving(true);
    setError("");
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => String(n.id) !== String(noteId)));
      if (String(selectedNoteId) === String(noteId)) {
        setSelectedNoteId(null);
      }
      getAllTags()
        .then((t) => setTags(Array.isArray(t) ? t : []))
        .catch(() => {});
    } catch (e) {
      setError(e?.message || "Failed to delete note.");
    } finally {
      setSaving(false);
    }
  }

  const headerStatus = backendOk === null ? "Checking…" : backendOk ? "Online" : "Offline";

  return (
    <AppLayout
      onCreateNew={handleCreateNew}
      createDisabled={saving}
      statusText={headerStatus}
      subtitle="Personal Notes Organizer"
    >
      <div className="grid">
        <aside className="sidebar">
          <div className="panelHeader">
            <div className="panelTitle">Tags</div>
            <button
              className="ghostButton"
              type="button"
              onClick={() => setSelectedTag(null)}
              disabled={saving}
              aria-pressed={selectedTag === null}
            >
              All
            </button>
          </div>

          <TagSidebar
            tags={tags}
            notes={notes}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            disabled={saving}
          />
        </aside>

        <main className="main">
          <div className="topRow">
            <SearchBar value={search} onChange={setSearch} disabled={saving} />
          </div>

          {error ? <div className="errorBanner">{error}</div> : null}

          <div className="contentSplit">
            <section className="listPane" aria-label="Notes list">
              <NoteList
                loading={loading}
                notes={filteredNotes}
                selectedNoteId={selectedNoteId}
                onSelect={setSelectedNoteId}
                onDelete={handleDelete}
                disabled={saving}
              />
            </section>

            <section className="detailPane" aria-label="Note editor">
              <NoteEditor
                key={selectedNote ? selectedNote.id : "empty"}
                note={selectedNote}
                onSave={handleSave}
                saving={saving}
              />
            </section>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
