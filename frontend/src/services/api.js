// src/services/apiService.js - UPDATED WITH PROFILE MANAGEMENT
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API_BASE = import.meta.env.VITE_API_URL; 
// Render injects this automatically from render.yaml (or from .env during local dev)

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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

// Example helpers you can reuse
export const get = (path) => apiFetch(path);
export const post = (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = (path) => apiFetch(path, { method: 'DELETE' });

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
        } catch (e) {
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

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  // Profile management methods
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async updateAvatar(avatarUrl) {
    return this.request('/users/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar: avatarUrl })
    });
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  // Freelancer skill management
  async addSkill(skill) {
    return this.request('/users/skills', {
      method: 'POST',
      body: JSON.stringify({ skill })
    });
  }

  async removeSkill(skill) {
    return this.request(`/users/skills/${encodeURIComponent(skill)}`, {
      method: 'DELETE'
    });
  }

  // Portfolio management
  async addPortfolioItem(portfolioData) {
    return this.request('/users/portfolio', {
      method: 'POST',
      body: JSON.stringify(portfolioData)
    });
  }

  async removePortfolioItem(index) {
    return this.request(`/users/portfolio/${index}`, {
      method: 'DELETE'
    });
  }

  // Project management methods (placeholders for future implementation)
  async getProjects(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/projects?${queryParams}`);
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  async updateProject(projectId, projectData) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  // Proposal management methods (placeholders for future implementation)
  async getProposals(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/proposals?${queryParams}`);
  }

  async createProposal(proposalData) {
    return this.request('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData)
    });
  }

  async updateProposal(proposalId, proposalData) {
    return this.request(`/proposals/${proposalId}`, {
      method: 'PUT',
      body: JSON.stringify(proposalData)
    });
  }

  async deleteProposal(proposalId) {
    return this.request(`/proposals/${proposalId}`, {
      method: 'DELETE'
    });
  }

  // File upload method
  async uploadFile(file, folder = 'avatars') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'File upload failed');
    }

    return data;
  }

  // Utility methods
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();