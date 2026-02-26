/**
 * Backend API helper.
 * Uses NEXT_PUBLIC_API_BASE so it can be configured per environment.
 */

function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) {
    // Intentionally throw: this is required configuration.
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE environment variable (frontend cannot reach backend)."
    );
  }
  return base.replace(/\/+$/, "");
}

async function request(path, options = {}) {
  const url = `${getApiBase()}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ? ` ${data.detail}` : "";
    } catch {
      // ignore json parse
    }
    throw new Error(`API request failed (${res.status}).${detail}`);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// PUBLIC_INTERFACE
export async function healthCheck() {
  /** Check if backend is reachable. */
  try {
    await request("/healthz", { method: "GET" });
    return { ok: true };
  } catch {
    // Some backends may not expose /healthz; treat as unknown.
    return { ok: false };
  }
}

// PUBLIC_INTERFACE
export async function getNotes() {
  /** List notes. Expected response: array of notes. */
  return request("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote(note) {
  /** Create a note. Body: {title, content, tags}. */
  return request("/notes", { method: "POST", body: JSON.stringify(note) });
}

// PUBLIC_INTERFACE
export async function updateNote(id, patch) {
  /** Update a note. Body: {title, content, tags}. */
  return request(`/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(patch)
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export async function getAllTags() {
  /** List all tags. Expected response: array of strings. */
  return request("/tags", { method: "GET" });
}
