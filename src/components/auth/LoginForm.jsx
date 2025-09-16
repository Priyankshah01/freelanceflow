// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import FormField from '../common/FormField';
import Button from '../common/Button';
import { AlertCircle, Loader2 } from 'lucide-react';

const LoginForm = ({ onToggleMode, onSuccess }) => {
  const { login, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const user = await login(formData.email, formData.password);
      onSuccess?.(user);
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your FreelanceFlow account</p>
      </div>

      {/* Demo credentials info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Freelancer:</strong> freelancer@test.com / password123</div>
          <div><strong>Client:</strong> client@test.com / password123</div>
          <div><strong>Admin:</strong> admin@test.com / password123</div>
        </div>
      </div>

      {authError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{authError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          error={errors.email}
          required
        />

        <FormField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          required
          showPasswordToggle
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;