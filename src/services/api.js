// src/services/apiService.js

// ONE strategy:
// - In production (not localhost), ALWAYS call same-origin '/api' so Vercel proxies to Render.
// - In local dev (when hostname is localhost/127.0.0.1), hit 'http://localhost:5000/api'.
const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

const API_BASE_URL = isLocalhost
  ? 'http://localhost:5000/api'
  : '/api';

console.log('🌐 Using API base:', API_BASE_URL);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Ensure headers + JSON body handling
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {}),
    };

    let body = options.body;
    if (body && typeof body !== 'string' && !(body instanceof FormData)) {
      // If sending JSON object, stringify it
      body = JSON.stringify(body);
      // Make sure JSON header is set (skip if FormData)
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    const config = {
      method: options.method || 'GET',
      headers,
      body: options.method && options.method !== 'GET' ? body : undefined,
      // you can add credentials if you ever switch to cookie auth
      // credentials: 'include'
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }

        if (response.status === 401) {
          // Token expired/invalid — clear and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        throw new Error(errorMessage);
      }

      // Auto-handle empty responses (204) vs JSON
      if (response.status === 204) return null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      // Fallback to text if server returns non-JSON
      return await response.text();

    } catch (error) {
      // Network-level failures
      if (error instanceof TypeError && /Failed to fetch/i.test(error.message)) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // -------- Auth --------
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

  // -------- Admin (examples) --------
  adminLogin(credentials) {
    return this.request('/auth/admin/login', { method: 'POST', body: credentials });
  }
  getAdminOverview() {
    return this.request('/admin/overview');
  }

  // Add other domain methods here...
}

const apiService = new ApiService();
export default apiService;

// Keep these helpers so existing imports keep working,
// but route everything through the singleton service.
export const get = (path) => apiService.request(path);
export const post = (path, body) => apiService.request(path, { method: 'POST', body });
export const put = (path, body) => apiService.request(path, { method: 'PUT', body });
export const del = (path) => apiService.request(path, { method: 'DELETE' });
