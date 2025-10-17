// src/services/apiService.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

console.log("🌐 Using API base:", API_BASE_URL);

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

// Example helpers
export const get = (path) => apiFetch(path);
export const post = (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = (path) => apiFetch(path, { method: 'DELETE' });

// ApiService class stays mostly the same
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // Authentication
  async login(credentials) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }); }
  async register(userData) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }); }
  async getProfile() { return this.request('/auth/me'); }
  async logout() { return this.request('/auth/logout', { method: 'POST' }); }

  // ... other methods unchanged
}

export default new ApiService();
