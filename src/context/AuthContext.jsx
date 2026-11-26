// src/context/AuthContext.jsx - REAL VERSION (Replace existing)
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

import { API_BASE_URL } from '../config/api';

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
}

const apiService = new ApiService();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('🔍 Checking existing auth...');
      const response = await apiService.getProfile();
      const userData = response.data.user;
      
      console.log('✅ User authenticated:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setError(null); // Clear any previous errors
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Attempting login for:', email);
      const response = await apiService.login({ email, password });
      const { user: userData, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Login successful:', userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Attempting signup for:', userData.email);
      const response = await apiService.register(userData);
      const { user: newUser, token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('✅ Signup successful:', newUser);
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error('❌ Signup failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      console.log('✅ Logged out successfully');
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    checkAuth,
    loading,
    error,
    isAuthenticated: !!user,
    isFreelancer: user?.role === 'freelancer',
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};