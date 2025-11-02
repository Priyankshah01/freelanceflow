// src/services/apiService.js

// 1) First priority: Vite envs (best for Vercel)
const ENV_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
  '';

// 2) Second priority: detect localhost from the browser
const isBrowser = typeof window !== 'undefined';
const isLocalhost =
  isBrowser && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

// 3) Final decision
const API_BASE_URL = ENV_BASE
  ? ENV_BASE.replace(/\/+$/, '')
  : isLocalhost
  ? 'http://localhost:5000/api'
  : 'https://freelanceflow-backend-01k4.onrender.com/api';

console.log('🌐 Using API base:', API_BASE_URL);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = isBrowser ? localStorage.getItem('token') : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${
      endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    }`;

    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {}),
    };

    let body = options.body;
    if (body && typeof body !== 'string' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const config = {
      method: options.method || 'GET',
      headers,
      body: options.method && options.method !== 'GET' ? body : undefined,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // ignore JSON error
        }

        // handle expired / invalid token
        if (response.status === 401 && isBrowser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }

        throw new Error(message);
      }

      // no content
      if (response.status === 204) return null;

      const ct = response.headers.get('content-type') || '';
      return ct.includes('application/json')
        ? response.json()
        : response.text();
    } catch (err) {
      // network / CORS / backend down
      if (err instanceof TypeError && /Failed to fetch/i.test(err.message)) {
        throw new Error(
          'Unable to connect to server. Please check if the backend is running.'
        );
      }
      throw err;
    }
  }

  // ---------- Auth ----------
  login(credentials) {
    return this.request('/auth/login', { method: 'POST', body: credentials });
  }
  register(userData) {
    return this.request('/auth/register', { method: 'POST', body: userData });
  }
  getProfile() {
    return this.request('/auth/me');
  }
  logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // ---------- Admin ----------
  adminLogin(credentials) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: credentials,
    });
  }
  getAdminOverview() {
    return this.request('/admin/overview');
  }
}

const apiService = new ApiService();
export default apiService;

// Convenience wrappers (so old imports keep working)
export const get = (path) => apiService.request(path);
export const post = (path, body) =>
  apiService.request(path, { method: 'POST', body });
export const put = (path, body) =>
  apiService.request(path, { method: 'PUT', body });
export const del = (path) => apiService.request(path, { method: 'DELETE' });
