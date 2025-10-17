// src/services/http.js
// Centralized, smart base URL + minimal fetch wrapper (no axios).

/**
 * Returns a clean API root from VITE_API_URL:
 * - trims spaces
 * - removes trailing slashes
 * - strips a trailing `/api` (to avoid /api/api duplication)
 * Examples:
 *   "http://localhost:5000"           -> "http://localhost:5000"
 *   "http://localhost:5000/"          -> "http://localhost:5000"
 *   "http://localhost:5000/api"       -> "http://localhost:5000"
 *   "http://localhost:5000/api/"      -> "http://localhost:5000"
 */
export function getApiRoot() {
  let root = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").trim();

  // remove trailing slashes
  root = root.replace(/\/+$/, "");

  // remove trailing /api or /api/ (case-insensitive)
  if (/\/api$/i.test(root)) {
    root = root.slice(0, -4);
  }

  return root;
}

/**
 * Builds a tiny client for a given API segment (e.g., "admin", "auth", "projects").
 * Usage:
 *   const admin = makeClient("admin");
 *   admin.req("/overview");
 */
export function makeClient(segment /* e.g., "admin" */) {
  const BASE = `${getApiRoot()}/api/${segment}`;

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  async function req(path, options = {}) {
    if (!path.startsWith("/")) {
      throw new Error(`Path must start with "/": received "${path}"`);
    }

    const res = await fetch(BASE + path, {
      headers: authHeaders(),
      ...options,
    });

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } catch { /* ignore JSON parse error */ }

      if (res.status === 401) {
        // Auto logout if unauthorized
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw new Error(msg);
    }

    // Some endpoints might return 204 No Content
    if (res.status === 204) return null;

    return res.json();
  }

  return { req };
}
