// src/services/http.js
//
// Single HTTP client for ALL roles (admin, client, freelancer).
// In dev: http://localhost:5000/api
// In prod: your Render backend (no vercel.json needed)

const isLocalhost =
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const API_ROOT = isLocalhost
  ? 'http://localhost:5000/api'
  : 'https://freelanceflow-backend-01k4.onrender.com/api'; // <- your Render base

console.log('🌐 HTTP using API root:', API_ROOT);

// Utility: safely join URL parts with single slashes
function joinUrl(base, ...parts) {
  const strip = (s) => String(s).replace(/(^\/+|\/+$)/g, '');
  const b = String(base).replace(/\/+$/g, '');
  const rest = parts.map(strip).filter(Boolean).join('/');
  return rest ? `${b}/${rest}` : b;
}

// Core request with token + JSON handling
export async function httpRequest(endpoint, options = {}) {
  const url = joinUrl(API_ROOT, endpoint);

  // Assemble headers
  const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : null;
  const headers = {
    ...(options.headers || {}),
  };

  // If body is a plain object (not FormData/string), JSON-encode it
  let body = options.body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isFormData && typeof body !== 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = JSON.stringify(body);
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const config = {
    method: options.method || 'GET',
    headers,
    body: (configMethod => (configMethod && configMethod !== 'GET') ? body : undefined)(options.method),
  };

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      // Try to extract JSON error
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        msg = data?.message || msg;
      } catch {}

      if (res.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {}
        if (typeof window !== 'undefined') window.location.href = '/login';
      }

      throw new Error(msg);
    }

    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();

  } catch (err) {
    if (err instanceof TypeError && /Failed to fetch/i.test(err.message)) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw err;
  }
}

// Factory: namespaced client (e.g., makeClient('admin') -> /api/admin/*)
export function makeClient(segment = '') {
  const base = segment ? joinUrl(API_ROOT, segment) : API_ROOT;

  return {
    base,
    async req(path = '', options = {}) {
      const endpoint = joinUrl(base, path);
      // Pass through to httpRequest but with full endpoint relative to API root
      // Strip API_ROOT to avoid double prefix if joinUrl included it already
      const relative = endpoint.replace(new RegExp(`^${API_ROOT.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}/?`), '');
      return httpRequest(relative, options);
    }
  };
}

// Convenience helpers (optional)
export const apiGet  = (p)        => httpRequest(p);
export const apiPost = (p, body)  => httpRequest(p, { method: 'POST', body });
export const apiPut  = (p, body)  => httpRequest(p, { method: 'PUT', body });
export const apiDel  = (p)        => httpRequest(p, { method: 'DELETE' });
