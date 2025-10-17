// src/services/http.js
// Centralized, smart fetch client that dynamically picks the backend URL.

export function getApiRoot() {
  // VITE_API_URL should be set in your .env files or Vercel Environment Variables
  let root = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();

  // Remove trailing slashes
  root = root.replace(/\/+$/, "");

  // Remove trailing /api if present
  if (/\/api$/i.test(root)) {
    root = root.slice(0, -4);
  }

  return root;
}

/**
 * Creates a small API client for a given segment, e.g., "auth", "admin", "projects".
 * Usage:
 *   const auth = makeClient("auth");
 *   auth.req("/login");
 */
export function makeClient(segment) {
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

    try {
      const res = await fetch(BASE + path, {
        headers: authHeaders(),
        ...options,
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          msg = data.message || data.error || msg;
        } catch {
          // ignore JSON parse errors
        }

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        throw new Error(msg);
      }

      if (res.status === 204) return null;

      return res.json();
    } catch (err) {
      console.error("❌ API request failed:", err.message);
      throw new Error("Unable to connect to server. Please check if the backend is running.");
    }
  }

  return { req };
}
