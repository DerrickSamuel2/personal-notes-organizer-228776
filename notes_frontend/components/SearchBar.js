import styles from "../styles/SearchBar.module.css";

/**
 * Search box for filtering notes by title/content.
 */
export default function SearchBar({ value, onChange, disabled }) {
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor="search">
        Search
      </label>
      <input
        id="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Search notes…"
      />
    </div>
  );
}
