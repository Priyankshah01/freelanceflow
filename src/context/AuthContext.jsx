// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

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
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with actual API call
      const mockResponse = await mockLogin(email, password);
      
      const { user: userData, token } = mockResponse;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (err) {
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
      
      // TODO: Replace with actual API call
      const mockResponse = await mockSignup(userData);
      
      const { user: newUser, token } = mockResponse;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
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

// Mock API functions - Replace these with actual API calls
const mockLogin = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock users for testing
      const mockUsers = [
        {
          id: 1,
          email: 'freelancer@test.com',
          name: 'John Doe',
          role: 'freelancer',
          avatar: null
        },
        {
          id: 2,
          email: 'client@test.com',
          name: 'Jane Smith',
          role: 'client',
          avatar: null
        },
        {
          id: 3,
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
          avatar: null
        }
      ];

      const user = mockUsers.find(u => u.email === email);
      
      if (user && password === 'password123') {
        resolve({
          user,
          token: 'mock-jwt-token-' + user.id
        });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate network delay
  });
};

const mockSignup = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email && userData.password && userData.name && userData.role) {
        const newUser = {
          id: Date.now(),
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: null,
          createdAt: new Date().toISOString()
        };
        
        resolve({
          user: newUser,
          token: 'mock-jwt-token-' + newUser.id
        });
      } else {
        reject(new Error('Missing required fields'));
      }
    }, 1000);
  });
};